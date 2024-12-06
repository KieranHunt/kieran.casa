---
layout: post
title: "How I built that DDB TTL graph"
permalink: /ddb-ttl-how-to/
date: 2024-12-06 00:00:00 +0200
---

In my [last post](/ddb-ttl/) I wrote about what latency to expect when using DDB's TTL feature.
That post features a live graph showing the measured latency. I'll post it here again:

![](https://ddbttlstack-bucket83908e77-ymypyzt7abf1.s3.us-east-1.amazonaws.com/ttl-latency.png)

It made the rounds [on Reddit](https://www.reddit.com/r/aws/comments/1h4czru/dynamodbs_ttl_latency/) ([archive](https://archive.ph/lgzNg)) and had some good discussion.
I thought I'd use _this_ post to talk about how I built it.

The broad idea was to build a system that:

- periodically inserts an item into a DynamoDB table,
- watches for deletions by TTL and,
- compares the TTL timestamp with the actual removal time.

The difference between those two timestamps is more or less DDB's TTL latency.

I built the app using [CDK](https://aws.amazon.com/cdk/) ([archive](https://archive.ph/CNTmO)).
In the following sections I'll go through each part of the system, give the CDK code I use to build it, business logic code (if any) and a peek at what the data looks like.
Find a link to a GitHub repo with the complete CDK code right at the end of this post.

But first, here's a look at the whole system:

![Architecture diagram]({{ "/assets/2024-12-06-ddb-ttl-architecture.png" | relative_url }})

## A: EventBridge Scheduler

I wanted a constant source of work to trigger inserts into the DynamoDB table.
EventBridge is a great fit here and can trigger minutely.
That's the fastest it can trigger (as of 2024-12-06) but that's good enough for me.

```ts
const putItemRule = new Rule(this, "EventBridgeRule", {
  schedule: Schedule.rate(Duration.minutes(1)),
});
```

See: [aws-cdk-lib.aws_events module · AWS CDK](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_events-readme.html#scheduling)

## 1: EventBridgeEvent

I don't care about the contents of this event.
Just that the event fires mostly on time.
But here's an example in case you find it useful:

```json
{
  "version": "0",
  "id": "f76ab64d-ad69-d13c-3cff-b170e13869e0",
  "detail-type": "Scheduled Event",
  "source": "aws.events",
  "account": "364265685121",
  "time": "2024-12-05T21:27:00Z",
  "region": "us-east-1",
  "resources": [
    "arn:aws:events:us-east-1:364265685121:rule/DdbTtlSlaStack-EventBridgeRule15224D08-99OfrtxmsKLs"
  ],
  "detail": {}
}
```

## B: ItemPutter Lambda Function

I chose to use CDK's `NodejsFunction` construct.
I really like using TypeScript in CDK _and_ then TypeScript again in my Lambda functions.
It keeps everything neatly in a single repository and allows me to share type information.

`NodejsFunction` nicely encapsulates building a TS-based Lambda function.
It bundles using [esbuild](https://esbuild.github.io/) ([archive](https://archive.ph/NrZSM)) and handles basically everything for you.

```ts
const itemPutter = new NodejsFunction(this, "ItemPutterFunction", {
  entry: join(__dirname, "put-item.function.ts"),
  handler: "handler",
});

putItemRule.addTarget(new LambdaFunction(itemPutter));
```

See: [aws-cdk-lib.aws_lambda_nodejs module · AWS CDK](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html)

## 2: PutItem Request

This Lambda function just needs to get data into the DynamoDB table.

It is probably a good time to talk about the table schema.
It's dead simple.
A partition key and sort key.
They're named `pk` and `sk` respectively.
Then an attribute called `ttl`.

The current time is placed into the `pk`, `sk` and `ttl`.
The `pk` and `sk` get it in ISO 8601 format.
And `ttl` gets it in seconds-since epoch.

```ts
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { type EventBridgeEvent } from "aws-lambda";

const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

export const handler = async (
  event: EventBridgeEvent<any, any>
): Promise<void> => {
  console.log("Processing EventBrideEvent:", JSON.stringify(event, null, 2));

  const now = new Date();
  const ttl = Math.floor(now.getTime() / 1000);

  await ddbClient.send(
    new PutItemCommand({
      TableName: process.env.TABLE,
      Item: {
        pk: { S: now.toISOString() },
        sk: { S: now.toISOString() },
        ttl: { N: ttl.toString() },
      },
    })
  );
};
```

## C: DynamoDB Table

You can probably guess at the configuration of the DynamoDB Table by now.
Of course, I have to configure the `timeToLiveAttribute` since that's the point of this whole exercise.
The stream is configured here, too.

```ts
const table = new Table(this, "Table", {
  billingMode: BillingMode.PAY_PER_REQUEST,
  partitionKey: {
    name: "pk",
    type: AttributeType.STRING,
  },
  sortKey: {
    name: "sk",
    type: AttributeType.STRING,
  },
  timeToLiveAttribute: "ttl",
  stream: StreamViewType.NEW_AND_OLD_IMAGES,
});

table.grantWriteData(itemPutter);

itemPutter.addEnvironment("TABLE", table.tableName);
```

Note the `grantWriteData`.
Most of CDK's L2 constructs have these `grant*` methods.
They do a good job of making it easy to grant additional permissions while still keeping the policies least priveledge.

And here's what the Lambda function puts into the table:

```json
[
  {
    "pk": "2024-12-04T19:48:28.281Z",
    "sk": "2024-12-04T19:48:28.281Z",
    "ttl": 1733341708
  },
  {
    "pk": "2024-12-04T19:45:28.319Z",
    "sk": "2024-12-04T19:45:28.319Z",
    "ttl": 1733341528
  },
  {
    "pk": "2024-12-04T19:46:28.370Z",
    "sk": "2024-12-04T19:46:28.370Z",
    "ttl": 1733341588
  }
]
```

## 3: DynamoDB Stream Event

As DynamoDB's TTL feature fires, it places the removed events into the stream.
Here's a sample event:

```json
{
  "Records": [
    {
      "eventID": "d245400f09fe95354fca023ac597d736",
      "eventName": "REMOVE",
      "eventVersion": "1.1",
      "eventSource": "aws:dynamodb",
      "awsRegion": "us-east-1",
      "dynamodb": {
        "ApproximateCreationDateTime": 1732815376,
        "Keys": {
          "sk": {
            "S": "2024-11-28T17:27:37.645631Z"
          },
          "pk": {
            "S": "2024-11-28T17:27:37.645631Z"
          }
        },
        "OldImage": {
          "sk": {
            "S": "2024-11-28T17:27:37.645631Z"
          },
          "pk": {
            "S": "2024-11-28T17:27:37.645631Z"
          },
          "ttl": {
            "N": "1732814857"
          }
        },
        "SequenceNumber": "3832500000000056612526359",
        "SizeBytes": 125,
        "StreamViewType": "NEW_AND_OLD_IMAGES"
      },
      "userIdentity": {
        "principalId": "dynamodb.amazonaws.com",
        "type": "Service"
      },
      "eventSourceARN": "arn:aws:dynamodb:us-east-1:750010179392:table/DdbTtlSlaStack-DDBTTL0622B9A2-X0AOESJQCXKS/stream/2024-11-27T21:35:33.881"
    }
  ]
}
```

See: [Tutorial \#2: Using filters to process some events with DynamoDB and Lambda - Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.Lambda.Tutorial2.html)

## D: StreamProcessor Lambda Function

Like the ItemPutter above, I used `NodejsFunction` to capture the events from the stream.

```ts
const streamProcessor = new NodejsFunction(this, "StreamProcessorFunction", {
  entry: join(__dirname, "process-stream.function.ts"),
  handler: "handler",
});

table.grantStreamRead(streamProcessor);

streamProcessor.addEventSource(
  new DynamoEventSource(table, {
    startingPosition: StartingPosition.LATEST,
    batchSize: 1,
    retryAttempts: 1,
    filters: [
      FilterCriteria.filter({ eventName: FilterRule.isEqual("REMOVE") }),
    ],
  })
);

streamProcessor.role!!.addToPrincipalPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["cloudwatch:GetMetricWidgetImage"],
    resources: ["*"],
  })
);
```

Also note that I've configured the DDB stream to filter to just `REMOVE` events.

Then I needed to do a little setup in the Lambda function.

```ts
import { type DynamoDBStreamHandler } from "aws-lambda";
import { metricScope, Unit, StorageResolution } from "aws-embedded-metrics";
import { z } from "zod";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  CloudWatchClient,
  GetMetricWidgetImageCommand,
} from "@aws-sdk/client-cloudwatch";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});
const cloudwatchClient = new CloudWatchClient({
  region: process.env.AWS_REGION,
});

export const handler: DynamoDBStreamHandler = metricScope(
  (metrics) => async (event, context) => {
    console.log(
      "Processing DynamoDB Stream Event:",
      JSON.stringify(event, null, 2),
      JSON.stringify(context, null, 2)
    );

    const parsedEvent = z
      .object({
        Records: z
          .array(
            z.object({
              eventName: z.enum(["REMOVE"]),
              dynamodb: z.object({
                Keys: z.object({
                  pk: z.object({
                    S: z.string(),
                  }),
                }),
              }),
            })
          )
          .length(1),
      })
      .parse(event);

    const record = parsedEvent.Records[0]!!;

    // The rest goes here
  }
);
```

Importantly, I've used Zod to make sure the event I'm handling looks the way I expect it to.
Read more about how you shouldn't trust runtime input in TypeScript in my post _[How I use io-ts to guarantee runtime type safety in my TypeScript](/io-ts/)_.

You may also notice that my function is wrapped in a `metricScope` function call.
That makes emitting metrics from Lambda a breeze.
More on that later.

See: [Zod Documentation](https://zod.dev/)

## 4: PutMetric by EMF

Emitting metrics is faily simple in Lambda these days.
Embedded Metrics Format (EMF) makes it as easy as logging.

```ts
const differenceFromNow =
  new Date().getTime() - new Date(record.dynamodb.Keys.pk.S).getTime();

metrics.putMetric(
  "ttl-latency",
  differenceFromNow,
  Unit.Milliseconds,
  StorageResolution.Standard
);
```

The `metrics` variable there is the same one vended by

See: [awslabs\/aws-embedded-metrics-node: Amazon CloudWatch Embedded Metric Format Client Library](https://github.com/awslabs/aws-embedded-metrics-node)

## E: CloudWatch Metrics

There's not much to say here.
Emitting the metrics from the function handles all of the "resource creation" on the CloudWatch side.
So there's nothing else I needed to set up.

## 5: GetMetricWidgetImage

```ts
const accountId = parseArn(context.invokedFunctionArn).accountId;

const getLatencyMetricWidgetImageOutput = await cloudwatchClient.send(
  new GetMetricWidgetImageCommand({
    MetricWidget: JSON.stringify({
      metrics: [
        [
          {
            expression: "(m1 / 1000) / 60",
            label: "Time elapsed between TTL and removal",
            id: "e1",
            region: environmentVariables.AWS_REGION,
            accountId,
          },
        ],
        [
          "aws-embedded-metrics",
          "ttl-latency",
          "LogGroup",
          context.functionName,
          "ServiceName",
          context.functionName,
          "ServiceType",
          "AWS::Lambda::Function",
          {
            id: "m1",
            visible: false,
            period: 300,
            region: environmentVariables.AWS_REGION,
            accountId,
          },
        ],
      ],
      sparkline: false,
      view: "timeSeries",
      stacked: false,
      region: environmentVariables.AWS_REGION,
      stat: "Maximum",
      period: 60,
      start: "-PT24H",
      yAxis: {
        left: {
          min: 0,
          showUnits: false,
          label: "Minutes",
        },
      },
      liveData: false,
      setPeriodToTimeRange: true,
      title: "DynamoDB TTL Latency",
      width: 768,
      height: 384,
      theme: "dark",
    }),
    OutputFormat: "png",
  })
);
```

These can be a bit hairy to construct.
I prefer manually designing the graphs in the CloudWatch console and then copying the source out into my codebase.
I did that here and then replaced hardcoded account IDs, regions and function names.

## F: S3 Bucket

```ts
const bucket = new Bucket(this, "Bucket", {
  publicReadAccess: true,
  blockPublicAccess: {
    blockPublicPolicy: false,
    blockPublicAcls: false,
    ignorePublicAcls: false,
    restrictPublicBuckets: false,
  },
  enforceSSL: true,
});

bucket.grantReadWrite(streamProcessor);

streamProcessor.addEnvironment("BUCKET", bucket.bucketName);
```

The bucket needs to allow public read access.
That's what makes the graph above viewable.

I also needed to pass the name of the bucket into the Lambda Function.

## 6: PutObject Request

```ts
await s3Client.send(
  new PutObjectCommand({
    Bucket: process.env.BUCKET,
    Key: "ttl-latency.png",
    Body: getLatencyMetricWidgetImageOutput.MetricWidgetImage,
    ContentEncoding: "base64",
    ContentType: "image/png",
  })
);
```

It took me a little time to work out that I needed to set the content encoding to base64.
But that made the upload stick.

Thanks for taking the time to go through that.
If you'd like a more cohesive view, the complete codebase is available on GitHub at [KieranHunt/ddb-ttl](https://github.com/KieranHunt/ddb-ttl).

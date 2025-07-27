---
layout: post
title: "Stop writing AWS SDK pagination loops that break"
permalink: /aws-sdk-paginators/
date: 2025-07-26
---

2025-07-27: I updated this post to include details on paginators in other AWS SDKs.

I see this everywhere:

```typescript
const allItems = [];
let nextToken: string | undefined;

do {
  const response = await dynamodb.scan({
    TableName: "MyTable",
    ExclusiveStartKey: nextToken,
  });

  allItems.push(...(response.Items || []));
  nextToken = response.LastEvaluatedKey;
} while (nextToken);
```

But this approach has some problems:

- There's mutable state with `allItems` and `nextToken`. Looking at you, `let`.
- It's easy to introduce bugs with loop conditions. You've got to make sure you're doing a `do while` loop, not a `while` loop.
- There can be memory issues with large result sets. This solution doesn't give you the chance to process just a single page of results.
- You have to be aware of the pagination token, and then handle it correctly. For example, with DDB, you must remember that the `LastEvaluatedKey` becomes the `ExclusiveStartKey`.

To solve most of these problems, the AWS SDK ships built-in paginators for all paginated operations:

```typescript
import { paginateScan } from "@aws-sdk/lib-dynamodb";

const allItems = [];
for await (const page of paginateScan(
  /* DynamoDBPaginationConfiguration */ { client: dynamodb },
  /* ScanCommandInput */ { TableName: "MyTable" }
)) {
  allItems.push(...(page.Items || []));
}
```

Their benefits are:

- Eliminates _most_ mutable state. No more `let` variables for pagination tokens.
- Automatic pagination tokens management. The SDK handles pagination tokens automatically.
- Simpler loop logic. Just iterate until finished, no `do while` complexity.

Paginators are not just for JS/TS either. There's paginator support in:
- [Java](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/pagination.html) ([archive](https://archive.is/G1Fkt))
- [Python](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/paginators.html) ([archive](https://archive.is/6mgFt))
- [Go](https://docs.aws.amazon.com/sdk-for-go/v2/developer-guide/using.html#using-operation-paginators) ([archive](https://archive.is/WFAuS))

And I'm sure others, too.

## Some more examples

**CloudWatch Logs:**

```typescript
import { paginateDescribeLogGroups } from "@aws-sdk/client-cloudwatch-logs";

for await (const page of paginateDescribeLogGroups(
  { client: cloudwatchLogs },
  {}
)) {
  console.log(page.logGroups);
}
```

**EC2 Images:**

```typescript
import { paginateDescribeImages } from "@aws-sdk/client-ec2";

for await (const page of paginateDescribeImages(
  { client: ec2 },
  { Owners: ["self"] }
)) {
  console.log(page.Images);
}
```

Stop writing manual pagination loops. Use the SDK's paginators instead.

## A Utility Function

For cases where you need all results in an array, this utility function is helpful:

```typescript
export const toArray = async <T>(gen: AsyncIterable<T>): Promise<T[]> => {
  const out: T[] = [];
  for await (const x of gen) {
    out.push(x);
  }
  return out;
};

// Use it like this

const pages = await toArray(
  paginateScan({ client: dynamodb }, { TableName: "MyTable" })
);
const allItems = pages.flatMap((page) => page.Items || []);
```

You'll notice that we got rid of `allItems` from above!
It is now hidden in the `toArray` function.
The mutability is constrained to the scope of the `toArray` function.

## Links

- [Pagination using Async Iterators in modular AWS SDK for JavaScript \| AWS Developer Tools Blog](https://aws.amazon.com/blogs/developer/pagination-using-async-iterators-in-modular-aws-sdk-for-javascript/) ([archive](https://archive.is/Kt8T0))
- [paginateScan for the AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-lib-dynamodb/Function/paginateScan/) ([archive](https://archive.is/zr4Em))
- [paginateDescribeLogGroups for the AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-cloudwatch-logs/Function/paginateDescribeLogGroups/) ([archive](https://archive.is/g7njR))
- [paginateDescribeImages for the AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-ec2/Function/paginateDescribeImages/) ([archive](https://archive.is/LX0MG))

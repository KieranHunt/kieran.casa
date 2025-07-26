---
layout: post
title: "Stop writing AWS SDK pagination loops that break"
permalink: /aws-sdk-paginators/
date: 2025-07-26
---

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

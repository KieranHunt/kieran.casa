---
layout: post
title: "S3's Lifecyle Latency"
permalink: /s3-lifecycle/
date: 2025-02-19 00:00:00 +0200
---

[Last year I posted a graph showing DDB's TTL Latency](ddb-ttl). 
That got me thinking about which other AWS services have latencies that I can measure?

DDB's version of the feature feels quite precise.
You specify the time to the second that you want an item to expire as a column of the table.
As of writing this DDB actions that deletion within about 12 minutes.

Like DDB, S3 has an auto-delete-objects-after-a-certain-time feature.
With S3 you specify how long to wait after the object was last written before it is deleted.
S3's lifecycle policies have a minimum granularity of days.

The below graph is a measure of the time between when an S3 object is written, and when a Lambda function receives a lifecycle event notification for its deletion.
It's measured in hours.

![S3 minimum, maximum and mean Lifecycle Latency](https://s3lifecyclestack-metricbucket8c17f29f-ojkbiwz84gzz.s3.us-east-1.amazonaws.com/s3-latency.png)

S3 seems to process its lifecycle workflows in batches.
Even though I am writing to the bucket minutely, the lifecycle events are only firing daily.

The first 24 hours of an object's life it is ineligible for deletion.
It seems like, for an additional 16 hours after the initial 24, S3 continues to avoid deleting the object.
Finally, at about 40 hours old, S3 starts deletions.
Since it batches daily, some objects age to just over 60 hours before being deleted.
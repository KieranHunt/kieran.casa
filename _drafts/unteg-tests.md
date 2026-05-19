---
layout: post
title: "Unteg tests"
permalink: /unteg-tests/
date: 2025-12-18T08:55:35.318+00:00
---

It's the normal story.
Your team recieves a ticket.
There's a bug in production.
You need to reproduce it.

You see a stack trace that looks like this:

```
2025-12-09T14:47:02,281 [ERROR] 8e4c2f11-af99-4b2c-b0a4-43f9a271e4b2 (pool-53821-thread-5) casa.kieran.replication.coordinator.ShardReplicationCoordinator: Failed to start task with executionId EXExEU5smcx2rxEsrA-shard-replication-2,
 java.lang.RuntimeException: Exceeded maximum retries while updating replication policy.
    at casa.kieran.replication.policy.PolicyManager.updatePolicyWithRetry(PolicyManager.kt:189) ~[ReplicationCore-1.2.jar:?]
    at casa.kieran.replication.policy.PolicyManager.apply(PolicyManager.kt:127) ~[ReplicationCore-1.2.jar:?]
    at casa.kieran.replication.coordinator.ShardReplicationCoordinator.applyPolicy(ShardReplicationCoordinator.kt:363) ~[ReplicationCoordinator-1.0.jar:?]
    at casa.kieran.replication.coordinator.ShardReplicationCoordinator.startTask$lambda$6(ShardReplicationCoordinator.kt:107) ~[ReplicationCoordinator-1.0.jar:?]
    at casa.kieran.sdkcontext.SdkSession.withDataClient(SdkSession.kt:434) ~[SDKContext-1.0.jar:?]
    at casa.kieran.replication.coordinator.ShardReplicationCoordinator.startTask(ShardReplicationCoordinator.kt:87) ~[ReplicationCoordinator-1.0.jar:?]
    at casa.kieran.replication.engine.ClusterEngine.startTask(ClusterEngine.kt:74) ~[ReplicationCoordinator-1.0.jar:?]
    at casa.kieran.replication.global.ShardReplicationManager.startTask$lambda$0(ShardReplicationManager.kt:101) ~[ReplicationAggregates-1.0.jar:?]
    at casa.kieran.replication.global.ShardReplicationManager.withExceptionHandling(ShardReplicationManager.kt:348) ~[ReplicationAggregates-1.0.jar:?]
    at casa.kieran.replication.global.ShardReplicationManager.startTask(ShardReplicationManager.kt:86) ~[ReplicationAggregates-1.0.jar:?]
    at casa.kieran.replication.global.TaskProvider.startTask(TaskProvider.kt:30) ~[ReplicationAggregates-1.0.jar:?]
    at casa.kieran.controlsystem.manager.TaskManager.startTask$lambda$0(TaskManager.kt:67) ~[ControlSystem-1.0.jar:?]
    at casa.kieran.controlsystem.manager.TaskManager.withTaskMetrics(TaskManager.kt:163) ~[ControlSystem-1.0.jar:?]
    at casa.kieran.controlsystem.manager.TaskManager.startTask(TaskManager.kt:60) ~[ControlSystem-1.0.jar:?]
    at casa.kieran.controlsystem.activity.TaskStarter.startTask(TaskStarter.kt:233) ~[ControlSystem-1.0.jar:?]
    at casa.kieran.controlsystem.activity.TaskStarter.startTaskFanout$lambda$8$lambda$4(TaskStarter.kt:321) ~[ControlSystem-1.0.jar:?]
```

Oof. This is probably going to be a bit hairy to reproduce.
That's 4 JARs deep into the system.
Standing up the `ControlSystem` service isn't going to be fun.
It probably has a bunch of dependencies that you have to have in place before it works.

You could _maybe_ write a unit test.
But often, if you don't exactly understand how the bug manifests, then a unit test is just a guess. 

But you don't always have to do that.
Instead, you could write what I've been calling an unteg test. 
An unteg test combines a unit test with an integration test.

The way it works is that, instead of standing up a service to write a test against its API, you hook your unteg test directly into the code at a layer that makes sense.

That is, write a test that mocks out some dependencies and calls others for real. 

Picking the layer is essentially about picking which `StackTraceElement` you want to insert your test at.
Too high up the stack, and you'll need to handle many different dependencies.
Too low down the stack and your reproduction won't be high fidelity enough.

In this example, I'll hook into `ShardReplicationCoordinator`'s `applyPolicy` method.
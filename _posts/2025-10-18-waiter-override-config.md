---
layout: post
title: "A deep dive into WaiterOverrideConfiguration"
permalink: /waiter-override-configuration/
date: 2025-10-18T11:10:14+01:00
---

This post is 4ᵗʰ in a series about AWS SDK Waiters.
You definitely don't need to have read all the others before reading this one.
Though perhaps "Use AWS SDK Waiters" deserves a little skim to get up to speed:

1. [Use AWS SDK Waiters](/aws-sdk-waiters/)
1. [Write custom waiters](/custom-waiters/)
1. [Typescript waiters are a bit weird](/aws-sdk-waiters-ts/)

💃 **This post is dynamic** 💃<br/>
Each configuration value uses a simulator and timeline for visualizations.
Many of the retry behaviours depend on random values for things like jitter.
Reload this page to see how randomisation affects them.

🎮 **This post includes a simulator** 🎮<br/>
[Scroll to the bottom](#simulator) of this page to use the complete simulator.
It lets you configure every parameter in `WaiterOverrideConfiguration` and see how it affects the retry behaviour.

## Introduction

`WaiterOverrideConfiguration` ([docs](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/core/waiters/WaiterOverrideConfiguration.html), [archive](https://archive.ph/wip/f6Pfm)) is how you configure the timeout and retry behaviour for AWS SDK Waiters on the JVM.

Each AWS service defines their own `WaiterOverrideConfiguration`.
These are configured per-waiter method.
That is, the waiter for a CloudFront's `DistributionDeployed` is going to look quite different to the waiter for ECS's `TasksRunning`.
For example, I dug into the EC2 `waitUntilInstanceRunning` method and pulled out the following `WaiterOverrideConfiguration`:

```kotlin
WaiterOverrideConfiguration.builder()
  .maxAttempts(40)
  .waitTimeout(null)
  .backoffStrategyV2(
    BackoffStrategy.fixedDelayWithoutJitter(
      /* delay */ 15.seconds.toJavaDuration()
    )
  )
  .build()
```

In the rest of this post, I dig in to what each of those configuration values means and how best to pick between them.

Just before I start, I'm going to show the behaviour of waiters using different configuration values.
It helps to have a certain resource in mind while going through these examples.
I won't use any resource in particular, but maybe you could think of:
- Waiting for an SSM Command Invocation to complete
- Waiting for a CloudWatch Insights Query to complete, or
- Waiting for a Kinesis Stream to be created.

In the following examples the resource is, by default, set to reach its desired state after 10 seconds.
If the waiter hasn’t timed out or reached its maximum attempt threshold, it will transition to success

## `maxAttempts`

The `maxAttempts` value sets an upper bound on the number of times the waiter will check the state of the resource.
In the below example, I've set `maxAttempts` to low enough that the waiter will never finish.

{% include waiter-override-configuration-simulator.html id='max-attempts' maxAttempts='2' backoffStrategy='fixedDelayWithoutJitter' %}

After two checks of the resource, the waiter gives up.

With the rest of the configuration parameters available for a waiter, I don't actually think its necessary to constrain an upper bound on attempts.
Doing so means you have to do some complicated maths (or use my simulator below) to figure out the right upper value to pick.
Instead, trusting `waitTimeout` and picking a sensible delay between API calls should be enough.

## `waitTimeout`

The `waitTimeout` value configures how long you're willing to wait for the resource to transition into the desired state.
This is probably the most important value to configure in your waiter.

Some resources, like the SSM Commands Invocations in [my previous post](/aws-sdk-waiters/), should have a timeout value that depends on what the command is doing.
If your command includes a 5-minute sleep then your timeout should probably be configured for something a little bit more than 5 minutes.
SSM has some delay in delivering the command to the target instances, so you'll need to factor that in too.

Other resources, like an EC2 instance going into running, mostly depend on the AWS service and so can be generically defined.
It's probably fine to leave it up to whatever default AWS picked.

{% include waiter-override-configuration-simulator.html id='wait-timeout' waitTimeout='8' backoffStrategy='fixedDelayWithoutJitter' %}

## `backoffStrategyV2`

### `retryImmediately`

The simplest backoff strategy is `retryImmediately`.
It's the `for` loop of backoff strategies.

The waiter iterates, checking the state of the resource, over and over again, until, at some point, the resource reaches the desired state.
The next check completes the waiter.

In the following example, I've shrunk the resource state change delay to 1 second.
This keeps it within bounds for the simulator.

{% include waiter-override-configuration-simulator.html id='retry-immediately' backoffStrategy='retryImmediately' maxAttempts='10' stateDelay='1' %}

### `fixedDelayWithoutJitter`

The first real "strategy" is `fixedDelayWithoutJitter`.
This does exactly what you'd think.
It waits for the specified `delay` between checks of the resource.

{% include waiter-override-configuration-simulator.html id='fixed-delay-without-jitter' backoffStrategy='fixedDelayWithoutJitter' %}

This seems to be the default backoff strategy in the SDKs.
At least, I've yet to see one using something else.

### `fixedDelay`

Fixed delay has a little secret. 
It includes jitter!

With jitter, fixed delay waits between `0` seconds and the `delay` amount before re-checking the resource.
This means that you always get at least the same number of checks of the resource as you would with [`fixedDelayWithoutJitter`](#fixeddelaywithoutjitter). 
Often you get more.

{% include waiter-override-configuration-simulator.html id='fixed-delay' %}

### `exponentialDelayWithoutJitter`

Exponential delay, unlike fixed delay, introduces more and more wait time between checks of the resource.
The algorithm looks like this:

```
delay = min(baseDelay × 2 ^ (attempt - 1), maxDelay)
```

With a large enough `maxDelay`, and a resource that transitions state towards the second half of the `waitTimeout`, you can expect substantial periods of waiting. 
In the following example, the last wait took 8 seconds which is more than half of the entire waiter period.

{% include waiter-override-configuration-simulator.html id='exponential-delay-without-jitter' backoffStrategy='exponentialDelayWithoutJitter' %}

Since the algorithm picks the minimum between the `baseDelay` and `maxDelay`, you can actually reproduce the `fixedDelay` output by matching the two delays:

{% include waiter-override-configuration-simulator.html id='fake-fixed-delay' backoffStrategy='exponentialDelayWithoutJitter' maxDelaySeconds='5' baseDelaySeconds='5' %}

### `exponentialDelay`

Full jitter combines the jitter implementation as seen in [`fixedDelay`](#fixeddelay) with an exponential delay.

{% include waiter-override-configuration-simulator.html id='exponential-delay' backoffStrategy='exponentialDelay' %}

### `exponentialDelayHalfJitter`

And finally, half jitter gives you jitter somewhere between half the full value and the full value.
This gives you something closer to the behaviour of not having jitter while still keeping the jitter safety.

{% include waiter-override-configuration-simulator.html id='exponential-delay-half-jitter' backoffStrategy='exponentialDelayHalfJitter' %}

## Simulator

Play around with the simulator by tweaking any of its values below.

{% include waiter-override-configuration-simulator.html id='expanded' configurationVisible='true' simulatorConfigurationVisible='true' %}
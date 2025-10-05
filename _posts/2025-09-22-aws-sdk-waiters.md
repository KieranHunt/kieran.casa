---
layout: post
title: "Use AWS SDK Waiters"
permalink: /aws-sdk-waiters/
date: 2025-09-22
---

2025-10-05: I've written about using waiters in Javascript/Typescript. Read about it on [Typescript waiters are a bit weird](/aws-sdk-waiters-ts/).

2025-09-27: Continuing on with waiters, I've written a new post about building your own waiters for an resource. Read more at [Write custom waiters](/custom-waiters/).

Most distributed systems are eventually consistent. Callers instruct a resource to change from one state to another (like going from running to stopped) and must then wait some amount of time before that new state is achieved. 

Writing your own polling code to manage this adds complexity, maintenance cost and the opportunity for bugs.
It’ll either be too simple and not cover all of the edge cases (what if instead of going to stopped, it goes into failed) or too complex and force the user to consider exponential back-off and jitter. 

When used correctly, AWS SDK waiters can be the perfect tool to help one system drive consistency in another.
 They’re a pattern that helps to make your code simpler, easier to reason about, and more resilient.

## An example

Since waiters wait for a resource to reach a certain state, and I want to provide real examples in this post, I’ll need a resource to use. 
From here on I’ve used an [AWS SSM Command Invocation](https://docs.aws.amazon.com/cli/latest/reference/ssm/get-command-invocation.html) ([archive](https://archive.ph/wip/lK5lU)) as the resource. 
There’s nothing particularly special about SSM or a Command Invocation that makes it more suitable as a waiter, it’s just a resource that is eventually consistent. 

If you’re not already familiar, SSM SendCommand executes an SSM document on a target EC2 instance. 
An SSM document is usually a series of shell scripts. 
It can take some time after you call SendCommand for the command to reach the instance and it can take some time after that for the document to run; depending on what the document does. 

I’ve also used AssertJ assertions throughout the following examples. 
Waiters are particularly useful during integration and canary testing and AssertJ provides a nice way to show the reader the expected behaviour. 
Read more about [why I use an assertion library](/why-use-an-assertion-library/) and [why I choose AssertJ over others](/hamcrest-vs-assertj/) elsewhere in this blog.

Here how to a waiter to wait until an SSM Command Invocation completes. 
The command itself is super basic. 
It just echo’s `Hello, World!` before completing.

```kotlin
val ssmClient = SsmClient.builder().build()
val ssmWaiter = ssmClient.waiter()

val sendCommandResponse = ssmClient.sendCommand(
  SendCommandRequest.builder()
    .instanceIds(listOf(instanceId))
    .documentName("AWS-RunShellScript")
    .parameters(mapOf(
      "commands" to listOf(
        /* https://kieran.casa/starting-bash-scripts/ */
        "#!/usr/bin/env bash",
        "set -o xtrace",
        "set -o errexit",
        "set -o nounset",
        "set -o pipefail",
        "echo 'Hello, World!'",
        "exit 0"
      )
    ))
    .build()
)

val getCommandInvocationResponseWaiterResponse = ssmWaiter.waitUntilCommandExecuted(
  GetCommandInvocationRequest.builder()
    .commandId(sendCommandResponse.command().commandId())
    .instanceId(sendCommandResponse.command().instanceIds().first())
    .build()
)

assertThat(getCommandInvocationResponseWaiterResponse.attemptsExecuted())
  .isGreaterThan(0)
assertThat(getCommandInvocationResponseWaiterResponse.matched().response().get().standardOutputContent())
  .contains("Hello, World!")
```

Execution of your code will pause at `ssmWaiter.waitUntilCommandExecuted` until one of the following happens:

- The command invocation successfully completes. As shown above.
- The command ends in a failure
- The waiter times out

## Failure modes

When a command ends in failure, expect the waiter to raise an exception:

```kotlin
val sendCommandResponse = ssmClient.sendCommand(
  SendCommandRequest.builder()
    .instanceIds(listOf(instanceId))
    .documentName("AWS-RunShellScript")
    .parameters(mapOf(
      "commands" to listOf(
        "#!/usr/bin/env bash",
        "exit 1"
      )
    ))
    .build()
)

assertThatThrownBy {
  ssmWaiter.waitUntilCommandExecuted(
    GetCommandInvocationRequest.builder()
      .commandId(sendCommandResponse.command().commandId())
      .instanceId(sendCommandResponse.command().instanceIds().first())
      .build()
  )
}
  .isInstanceOf(SdkClientException::class.java)
  .hasMessageContaining("A waiter acceptor with the matcher (path) was matched on parameter (Status=Failed) and transitioned the waiter to failure state")
```

And the same goes for when a waiter times out:

```kotlin
val sendCommandResponse = ssmClient.sendCommand(
  SendCommandRequest.builder()
    .instanceIds(listOf(instanceId))
    .documentName("AWS-RunShellScript")
    .parameters(mapOf(
      "commands" to listOf(
        "#!/usr/bin/env bash",
        "sleep 20",
        "exit 0"
      )
    ))
    .build()
)

assertThatThrownBy {
  ssmWaiter.waitUntilCommandExecuted(
    GetCommandInvocationRequest.builder()
      .commandId(sendCommandResponse.command().commandId())
      .instanceId(sendCommandResponse.command().instanceIds().first())
      .build()
  )
}
  .isInstanceOf(SdkClientException::class.java)
  .hasMessageContaining("The waiter has exceeded the max wait time or the next retry will exceed the max wait time + PT5S")
```

## Tuning timeouts

AWS SDK waiters come with default wait times, max attempts and backoff strategies. 
Much the same as what you’d expect to see when configuring retries. 
However, depending on the resource, different wait times may be more acceptable than the default. 

In the SSM waiter example, you really want to set your wait time to whatever is appropriate for the command that you’re running. 
If the command runs for about an hour, then the waiter should be ready to wait about that long. 
They’re configurable like this:

```kotlin
val ssmWaiter = SsmWaiter.builder()
  .client(ssmClient)
  .overrideConfiguration(
    WaiterOverrideConfiguration.builder()
      .maxAttempts(Int.MAX_VALUE)
      .waitTimeout(60.minutes.toJavaDuration())
      .backoffStrategyV2(BackoffStrategy.fixedDelay(5.seconds.toJavaDuration()))
      .build()
  )
  .build()
```

---

Read more about waiters at [Using waiters in the AWS SDK for Java 2.x](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/waiters.html) ([archive](https://archive.ph//JSqRD)). Waiters are also available in [other languages](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/migrate-waiters-signers.html) ([archive](https://archive.ph/t4gqv)).
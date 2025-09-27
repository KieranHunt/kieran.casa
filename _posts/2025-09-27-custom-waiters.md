---
layout: post
title: "Write custom waiters"
permalink: /custom-waiters/
date: 2025-09-27
---

In [Use AWS SDK Waiters](/aws-sdk-waiters/) I showed how useful AWS SDK waiters are when working with resources that are eventually consistent.
But not all resources are AWS resources.
And not all AWS resources even ship with waiters...

Well that shouldn't stop us.
The AWS SDKs actually ship with a really easy way to build waiters ourselves.

In that previous post, I showed you how I used AWS SDK waiters to wait for an SSM Command Invocation to complete.
I'd like to do something similar for an SSM Automation.
But SSM doesn't (currently) ship an official waiter for automations.
So I wrote my own.

```kotlin
/**
 * @constructor is private to prevent instantiation from outside the Builder
 * @property ssmClient the real SSM client. 
 *   This waiter implements the full SSM waiter interface through Kotlin delegation.
 */
class ExtendedSsmWaiter private constructor(
  private val ssmClient: SsmClient,
  private val waiterOverrideConfiguration: WaiterOverrideConfiguration
) : SsmWaiter by ssmClient.waiter() {
  /**
   * The waiter function.
   * When implementing waiters, think of them encapsulating a desired state and a way to query that state.
   * The desired state is expressed through the function itself. 
   * The desired state of this function is that an automation is executed.
   * The way to query the state is through the getAutomationExecution call and the [ssmClient] property.
   *
   * @return a waiter response object.
   *   If successful this will contain the [GetAutomationExecutionResponse] object from the last successful call.
   */
  fun waitUntilAutomationExecuted(getAutomationExecutionRequest: GetAutomationExecutionRequest): WaiterResponse<GetAutomationExecutionResponse> {
    val waiter = Waiter.builder(GetAutomationExecutionResponse::class.java)
      /**
       * A waiter builder is looking for two fields: acceptors and override configuration.
       *
       * [WaiterAcceptor]s is a series of predicate functions looking to advance the waiter state.
       * While a waiter is running, it will poll the [getAutomationExecutionRequest] call and pass the response to the acceptors.
       *
       * There are three waiter states that the acceptors can advance to: success, retry, and error.
       * Each type of acceptor can act on a normal response or an exception.
       * Which means that there are (`3 × 2 =`) 6 types of acceptors in total.
       *
       * The AWS SDK makes these available as static methods on the [WaiterAcceptor] interface.
       *
       * Waiters work by making the [getAutomationExecutionRequest] call and then passing the response into the acceptors.
       * They then one-by-one through the acceptors in the order they are defined.
       * If one of the acceptors returns `true`, the waiter will advance to whatever the acceptor tells it to.
       * If the acceptors return `false`, the waiter will continue on to the next acceptor.
       * If the acceptors throw an exception, the waiter will stop and the exception is returned.
       */
      .acceptors(
        listOf<WaiterAcceptor<in GetAutomationExecutionResponse>>(
          /**
           * There is likely only one or two responses that you'd consider successful.
           * This is the one state that you really want your waiter to reach.
           */
          WaiterAcceptor.successOnResponseAcceptor {
            it.automationExecution().automationExecutionStatus() == AutomationExecutionStatus.SUCCESS
          },
          /**
           * There are likely quite a few responses that warrant retrying the call.
           * Certainly there are more than what I've listed here.
           * Looking through the [AutomationExecutionStatus] I see twenty unique states there.
           * Maintaining this list here is probably the best argument in favour of always trying to use the AWS-vended waiters when possible.
           */
          WaiterAcceptor.retryOnResponseAcceptor {
            it.automationExecution().automationExecutionStatus() == AutomationExecutionStatus.IN_PROGRESS
          },
          WaiterAcceptor.retryOnResponseAcceptor {
            it.automationExecution().automationExecutionStatus() == AutomationExecutionStatus.PENDING
          },
          /**
           * Never forget to check for failure states.
           * Failure are not successes (duh!) but also mean that there's no point retrying the waiter.
           * They're non-successful terminal states.
           * When you forget failure states, the waiter will just keep retrying until the timeout is reached.
           */
          WaiterAcceptor.errorOnResponseAcceptor(
            {
              it.automationExecution().automationExecutionStatus() == AutomationExecutionStatus.FAILED
            },
            /**
             * Supplying a message on failure is a good idea.
             * The message is used in the exception thrown by the waiter.
             * It's a great way to quickly surface information about the resource that you're waiting on.
             * The more you reveal here, the quicker you'll debug a failure.
             */
            """
              Automation execution has status FAILED. Waiter transitioned to a failure state. 
              Automation Execution: $getAutomationExecutionRequest
            """.trimIndent()
          ),
        )
          /**
           * [WaitersRuntime.DEFAULT_ACCEPTORS] just instruct the waiter to retry on a response.
           * It essentially looks like this:
           *
           * ```kotlin
           * WaiterAcceptor.retryOnResponseAcceptor { true }
           * ```
           *
           * Including it last here means that the waiter will always retry non-exception responses if no other waiter matched earlier.
           */
          .plus(WaitersRuntime.DEFAULT_ACCEPTORS),
      )
      /**
       * Override configuration tells the waiter how long to poll for, which backoff strategy to use and how many attempts to make.
       */
      .overrideConfiguration(waiterOverrideConfiguration)
      .build()

    return waiter.run { ssmClient.getAutomationExecution(getAutomationExecutionRequest) }
  }

  companion object {
    fun builder(): Builder = Builder()
  }

  class Builder internal constructor() {
    private lateinit var ssmClient: SsmClient

    /**
     * Default waiter configurations can be quite tricky to pick.
     * For something like EC2's `waitUntilInstanceRunning`, you can make an educated guess on how long to wait.
     * But other processes may depend on what work you're waiting to happen.
     * [waitUntilAutomationExecuted] is an example of the latter type where the duration depends on what the automation is doing.
     *
     * As an example, EC2's [software.amazon.awssdk.services.ec2.waiters.DefaultEc2Waiter.instanceRunningWaiterConfig] sets a config of:
     * 40 total attempts × 15-second fixed delay backoff = 600 seconds or 10 minutes.
     *
     * In this example I've not set an upper bound on `maxAttempts`.
     * You either need to set max attempts or a wait timeout. Not both.
     * And wait timeout is far easier to reason about.
     * Just ask yourself, "how long should I wait for this to happen?"
     *
     * I've set it to wait 5 seconds between each attempt for a tight feedback loop.
     * Generally longer, wait timeouts can come with longer delays between attempts.
     *
     * I've set a wait timeout of 2 minutes as that's pretty reasonable for my use-case.
     */
    private var waiterOverrideConfiguration: WaiterOverrideConfiguration = WaiterOverrideConfiguration.builder()
      .maxAttempts(Int.MAX_VALUE)
      .backoffStrategyV2(BackoffStrategy.fixedDelay(5.seconds.toJavaDuration()))
      .waitTimeout(2.minutes.toJavaDuration())
      .build()

    fun withWaiterOverrideConfiguration(waiterOverrideConfiguration: WaiterOverrideConfiguration): Builder {
      this.waiterOverrideConfiguration = waiterOverrideConfiguration
      return this
    }

    fun withSsmClient(ssmClient: SsmClient): Builder {
      this.ssmClient = ssmClient
      return this
    }

    fun build(): ExtendedSsmWaiter = ExtendedSsmWaiter(ssmClient, waiterOverrideConfiguration)
  }
}
```

And then you use it just like you would any other waiter:

```kotlin
val ssmClient = SsmClient.builder().build()
val ssmWaiter = ExtendedSsmWaiter.builder()
  .withSsmClient(ssmClient)
  .build()

val startAutomationResponse = ssmClient.startAutomationExecution(
  StartAutomationExecutionRequest.builder()
    .documentName("AWS-ConfigureCloudWatchOnEC2Instance")
    .parameters(mapOf(
      "InstanceId" to listOf(instanceId)
    ))
    .build()
)

val getAutomationExecutionResponseWaiterResponse = ssmWaiter.waitUntilAutomationExecuted(
  GetAutomationExecutionRequest.builder()
    .automationExecutionId(startAutomationResponse.automationExecutionId())
    .build()
)

assertThat(getAutomationExecutionResponseWaiterResponse.attemptsExecuted())
  .isGreaterThan(0)
assertThat(getAutomationExecutionResponseWaiterResponse.matched().response())
  .isPresent
```

Hopefully you can also see that there's nothing AWS-specific about implementing a custom waiter.
So write them for: AWS's resources, other service's resources, and even your own resources. ✨


---
layout: post
title: "Typescript waiters are a bit weird"
permalink: /aws-sdk-waiters-ts/
date: 2025-10-05T08:05:38+03:00
---

Typescript (and Javascript) waiters for the AWS SDKs are weird enough that they deserve a post of their own.

I'll start here with an example using SSM and waiting on a Command Invocation. 
That's the resource you get back when you call `SendCommand`.
It's just like the examples in the [Use AWS SDK Waiters](/aws-sdk-waiters/) post which focuses on the JVM.

## A successful waiter

```ts
import {
  SendCommandCommand,
  SSMClient,
  waitUntilCommandExecuted,
} from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient();

const sendCommandOutput = await ssmClient.send(new SendCommandCommand({
  InstanceIds: [instanceId],
  DocumentName: "AWS-RunShellScript",
  Parameters: {
    "commands": [
      /* https://kieran.casa/starting-bash-scripts/ */
      "#!/usr/bin/env bash",
      "set -o xtrace",
      "set -o errexit",
      "set -o nounset",
      "set -o pipefail",
      "echo 'Hello, World!'",
      "exit 0"
    ]
  }
}));

const waiterResult = await waitUntilCommandExecuted({ client: ssmClient, maxWaitTime: 30 }, {
  CommandId: sendCommandOutput.Command?.CommandId,
  InstanceId: instanceId
});

const getCommandInvocationCommandOutput = waiterResult.reason as GetCommandInvocationCommandOutput;
  
assert.equal(getCommandInvocationCommandOutput.Status, "Success");
```

Here's where the javascript waiters start to drift from the Java ones.
First, you _must_ import the wait function directly. 
It's not a function on the ssmClient.

You pass in the client and `maxWaitTime` as fields in a object for the first parameter. 
`maxWaitTime` is how long you're willing to wait (in seconds) for the operation to complete.

Just to linger on that `maxWaitTime` for a little bit.
The Java-based waiters _always_ have a default wait time.
AWS decides for them how long waiters should wait.
But there are loads of occasions where it makes sense for you to override that value.
Like for resources where you control how long that take to run—and so you know best.
Or is situations where you have a finite time budget.
SSM Command Invocations is a great example of when you know better than AWS how long you expect them to take.

`minDelay` and `maxDelay` are also accepted along side `maxWaitTime` but are optional.
The waiter doesn't let you configure a retry strategy.
Instead it always uses exponential backoff.
If you want to get back to a fixed wait time back-off, just set `minDelay` and `maxDelay` to the same values.

You get back a `WaiterResult` and in the `reason` property is the result of the last polling operation.
In our case its a `GetCommandInvocationCommandOutput`.
But it's not strongly typed... Instead its `any`. 
So you need to cast it into `GetCommandInvocationCommandOutput` if you want to reach in to any of its fields.

## A failed waiter

Now here's what a waiter looks like when it fails.
That is, when the resource enters a state where it could never possibly reach the desired state.

You'll see that I've used Node's assertion library in the rest of this post.
Waiters are particularly useful during integration-style tests and so you'll often see assertions paired with waiters this way.

```ts
const sendCommandOutput = await ssmClient.send(new SendCommandCommand({
  InstanceIds: [instanceId],
  DocumentName: "AWS-RunShellScript",
  Parameters: {
    "commands": [
      "#!/usr/bin/env bash",
      "exit 1" /* ← bound to fail */
    ]
  }
}));

await assert.rejects(
  waitUntilCommandExecuted({ client: ssmClient, maxWaitTime: 30 }, {
    CommandId: sendCommandOutput.Command?.CommandId,
    InstanceId: instanceId
  }),
  (error: Error) => {
    assert.ok(error.name === "Error");

    const parsedMessage = JSON.parse(error.message);

    assert.equal(parsedMessage.state, "FAILURE");
    assert.ok("200: OK" in parsedMessage.observedResponses);

    assert.partialDeepStrictEqual(parsedMessage.reason as GetCommandInvocationCommandOutput, {
      Status: "Failed",
      StandardErrorContent: "failed to run commands: exit status 1",
      StatusDetails: 'Failed',
      // And all of the rest of the output fields
    });

    return true;
  }
);
```

So here's the next bit of weirdness.
The AWS SDK hides a bunch of information in a JSON string inside the error's message property.
Hmm...

Inside a failed waiter message we find:
- A state field with the string `FAILURE`.
- An `observedResponses` object where the keys are the response [HTTP status codes](https://httpgoats.com/) and the values are the count.
- A `reason` object which is the response from the last call. Again you'll want to cast into the actual output type.

When using a waiter like this, that `reason` information will probably be very helpful when debugging.

## A waiter that times out

To make a waiter time out, we can just make the SSM Command sleep for longer than the waiter is willing to wait.

```ts
const sendCommandOutput = await ssmClient.send(
  new SendCommandCommand({
    InstanceIds: [instanceId],
    DocumentName: "AWS-RunShellScript",
    Parameters: {
      commands: [
        "#!/usr/bin/env bash",
        "sleep 60" /* ← that'll sleep for 1 minute */,
        "exit 0",
      ],
    },
  }),
);

await assert.rejects(
  waitUntilCommandExecuted(
    {
      client: ssmClient,
      /**
       * `maxWaitTime` is set to something well below the 60 second sleep.
       * This is guaranteed to fail.
       */
      maxWaitTime: 5,
    },
    {
      CommandId: sendCommandOutput.Command?.CommandId,
      InstanceId: instanceId,
    },
  ),
  (error: Error) => {
    assert.ok(error.name === "TimeoutError");

    const parsedMessage = JSON.parse(error.message);

    assert.equal(parsedMessage.state, "TIMEOUT");
    assert.equal(parsedMessage.reason, "Waiter has timed out");
    assert.ok("200: OK" in parsedMessage.observedResponses);

    return true;
  },
);
```

Again you'll see that we need to parse information out of JSON in the error message.

Unfortunately that's all the information that you're given when a waiter times out.
It would've been great if it returned the value of the last response it got before timing out.

## Racing waiters

Finally, waiters can be aborted if you decide that you no longer want to wait for them.

Waiters accepts an (optional) abort signal parameter.
You can create the signal by first creating an [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) and then passing along the signal.
An abort controller allows you to send a cancellation message to the waiter thread.

In this post I use [`Promise.race`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race).
It accepts an array of promises and will wait for the first promise to resolve (or reject).
My waiters are configured with the same timeout (`PT30S`) but I expected Command #2 to always finish first.

```ts
const sendCommandOutputOne = await ssmClient.send(
  new SendCommandCommand({
    InstanceIds: [instanceId],
    DocumentName: "AWS-RunShellScript",
    Parameters: {
      commands: [
        "#!/usr/bin/env bash",
        "sleep 60" /* ← 🥈 always going to lose */,
        "exit 0",
      ],
    },
    Comment: "Command #1",
  }),
);

const sendCommandOutputTwo = await ssmClient.send(
  new SendCommandCommand({
    InstanceIds: [instanceId],
    DocumentName: "AWS-RunShellScript",
    Parameters: {
      commands: [
        "#!/usr/bin/env bash",
        "sleep 5" /* ← 🥇 always going to win */,
        "exit 0",
      ],
    },
    Comment: "Command #2",
  }),
);

const commandOneWaiterController = new AbortController();
// Note that we don't _await_ the waiter. We just want the Promise.
const commandOneWaiterPromise = waitUntilCommandExecuted(
  {
    client: ssmClient,
    maxWaitTime: 30,
    abortSignal: commandOneWaiterController.signal,
  },
  {
    CommandId: sendCommandOutputOne.Command?.CommandId,
    InstanceId: instanceId,
  },
);

const commandTwoWaiterController = new AbortController();
const commandTwoWaiterPromise = waitUntilCommandExecuted(
  {
    client: ssmClient,
    maxWaitTime: 30,
    abortSignal: commandTwoWaiterController.signal,
  },
  {
    CommandId: sendCommandOutputTwo.Command?.CommandId,
    InstanceId: instanceId,
  },
);

const winningCommandWaiter = await Promise.race([
  commandOneWaiterPromise,
  commandTwoWaiterPromise,
]);

const winningGetCommandInvocationCommandOutput =
    winningCommandWaiter.reason as GetCommandInvocationCommandOutput;
const winningCommandId = winningGetCommandInvocationCommandOutput.CommandId;

assert.equal(
  winningCommandId,
  sendCommandOutputTwo.Command?.CommandId,
  dedent`
    Expected command #2 to finish first. Instead command #1 won.
    Command #1 ID: ${sendCommandOutputTwo.Command?.CommandId}
    Command #2 ID: ${sendCommandOutputOne.Command?.CommandId}
  `,
);

commandOneWaiterController.abort();

await ssmClient.send(
  new CancelCommandCommand({
    CommandId: winningCommandId,
  }),
);
```

Once command #2 is determined to be the winner, we have to do a bit of clean-up.
We abort command #1's waiter thread, so it stops polling.
But aborting the waiter won't stop the Command Invcation.
That's done by calling `CancelCommand`.

Read more about waiters in:
- [Waiters in modular AWS SDK for JavaScript](https://aws.amazon.com/blogs/developer/waiters-in-modular-aws-sdk-for-javascript/) on the AWS Developer Tools Blog.
- [Waiters and signers](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/migrate-waiters-signers.html) on the AWS SDK for JavaScript documentation.
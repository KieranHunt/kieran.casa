---
layout: post
title: "Why you should use an assertion library"
date: 2023-03-02 00:00:00 +0200
permalink: /why-use-an-assertion-library/
---

I love assertion libraries. 
But I find I have to frequently explain just why they're so great.
So I wrote this post that, hopefully, summarises why I think you should use (and love) them too.

## Readability and consitency

Assertions, by standardising on _how_ to validate state, usually make it very clear _what_ state they're validating.

Without assertions, to validate whether a collection contains an item, you might write one of the following:

```kotlin
val list = listOf("foo", "bar", "baz")

assertTrue(list.any { it === "bar" })

assertEquals(1, list.filter { it === "bar" }.size)

assertEquals(listOf("bar"), list.filter { it === "bar" })
```

Some of those may be a little questionable, but they are all variations using JUnit's assertion statements.
They also all correctly validate the input.
But the poor reader of that test needs to first mentally parse what transformations the code is performing before they can understand what the test is asserting.
And the writer of the test has had to spare precious brain cycles thinking how exactly they can transform the input data a format that matches the assertion.

Compare that to a fluent assertion library.
With [AssertJ](https://assertj.github.io/doc/), this becomes:

```kotlin
val list = listOf("foo", "bar", "baz")

assertThat(list).contains("bar")
```

To someone reading this test, it is now immediately obvious _what_ this test is validating. 
To someone writing this test, _how_ to perform this validation is immediately clear, too.
Less bikeshedding come review time.

## Debugging

When an assertion like `assertTrue(list.any { it === "bar" })` fails, it produces an failure message like:

```
org.opentest4j.AssertionFailedError: 
Expected :true
Actual   :false
```

Now sure, that tells you that the test failed, and sure you can infer that `list` must not contain `bar`, but you're left stratching your head about what the list _does_ contain.
To find out, you'll need to stick a breakpoint on the test line and inspect the value of `list` before it enters the failing assertion.
But you could save precious seconds from every failed test if the assertion library just printed out what the list did contain.

Now compare that behaviour with AssertJ's output:

```
java.lang.AssertionError: 
Expecting:
 <["foo", "bar", "baz"]>
to contain:
 <["qux"]>
but could not find:
 <["qux"]>
```

With output like that, the wily tester can get straight to fixing the bug, rather than messing around with breakpoints.
A faster feedback loop means quicker validation and features out the door sooner.

## In summary

I don't really see a need for any of JUnit's assertions.
Sticking to using something like AssertJ's `assertThat` will simplify your tests, make them easier to read, and keep them plain to write.
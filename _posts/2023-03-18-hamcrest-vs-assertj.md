---
layout: post
title: "Why I pick AssertJ over Hamcrest"
date: 2023-03-18 00:00:00 +0200
permalink: /hamcrest-vs-assertj/
---

Hamcrest and AssertJ are both _fluent assertion libraries_ for the JVM.
Read my [Why you should use an assertion library](/why-use-an-assertion-library/) post if you don't know what that is o don't already use one.

First, what do Hamcrest and AssertJ assertions look like?
Well let's set up a little test class like this:

```kotlin
data class Hobbit(val name: String, val yearOfBirth: Number)

val frodo = Hobbit("frodo", 2968)
val sam = Hobbit("Samwise", 2980)
val someHobbits = listOf(frodo, sam)
```

In Hamcrest you may write some assertions like this:

```kotlin
assertThat(frodo.name, equalTo("Frodo"))
assertThat(sam.yearOfBirth, equalTo(2980))
assertThat(someHobbits, hasItem(frodo))
```

And in AssertJ you may write them something like this:

```kotlin
assertThat(frodo.name).isEqualTo("Frodo")
assertThat(sam.yearOfBirth).isEqualTo(2980)
assertThat(someHobbits).contains(frodo)
```

## Imports

Okay so let's start at the beginning.
With AssertJ, there's only a handful of things you ever really need to import.
Since AssertJ uses method chaining, all assertions are just calls on the output of the original assert call.
You really only ever need to import stuff like this:

```kotlin
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
```

Whereas with Hamcrest, as each matcher is its own static class, your imports look like this:

```kotlin
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.allOf
import org.hamcrest.Matchers.empty
import org.hamcrest.Matchers.equalTo
import org.hamcrest.Matchers.hasEntry
import org.hamcrest.Matchers.hasSize
// + however many other matchers you may use
```

In IntelliJ, while writing tests with Hamcrest, if I write `assertThat(someHobbits, )` and hit <kbd><kbd>ctrl</kbd> + <kbd>spacebar</kbd></kbd>, the first two options listed are the variables `frodo` and `sam`. 
Those aren't matchers themselves and not exaclty what I'm looking for. 
In fact, scrolling through all of the suggestions, I don't see a single Hamcrest matcher listed.
It's at this point in writing my Hamcrest tests that I open the [Javadoc for the `Matcher` interface](https://hamcrest.org/JavaHamcrest/javadoc/1.3/org/hamcrest/Matcher.html) and start searching through there...

Repeating the same experiment with AssertJ, if I write `assertThat(someHobbits).` and again hit <kbd><kbd>ctrl</kbd> + <kbd>spacebar</kbd></kbd>, I'm given a list containing:
- `toString()`
- `contains(...)`
- `hasSize(...)`
- `has(...)`
- etc.

Nice and relevent (except for that `.toString()`).

So AssertJ's chaining assertions _really_ make for a more fluid test experience. 
You rarely have to break your flow to hop out and read documentation.
Your IDE's autosuggests are usually good enough.

## Recursive matchers


So this always errors:

```kotlin
class Hobbit(val name: String, val yearOfBirth: Number)

val frodo = Hobbit("Frodo", 2968)
val frodo2 = Hobbit("Frodo", 2968)

assertThat(frodo).isEqualTo(frodo2)

// Expecting:
//  <com.example.AssertJTest$usingRecursiveComparison$Hobbit@53976f5c>
// to be equal to:
// <com.example.AssertJTest$usingRecursiveComparison$Hobbit@2bfc268b>
// but was not.
```

Because `frodo` is not the same object as `frodo2` and because AssertJ (and Hamcrest) are just using the objects' `.equals()` implementation, the one that just checks for reference equality, this will always fail.
In Kotlin we can work around this by using data classes.
Comparing data classes works the way you'd expect:

```kotlin
data class Hobbit(val name: String, val yearOfBirth: Number)

val frodo = Hobbit("Frodo", 2968)
val frodo2 = frodo.copy()

assertThat(frodo).isEqualTo(frodo2)

// 🎉
```

But you don't always have nice data classes.
Maybe you you don't want to refactor everything _into_ a data class.
Or maybe you're working with third-party Java code and can't.

With AssertJ's `usingRecursiveComparison`, we can compare any two objects created from normal classes:

```kotlin
class Hobbit(val name: String, val yearOfBirth: Number)

val frodo = Hobbit("Frodo", 2968)
val frodo2 = Hobbit("Frodo", 2968)

assertThat(frodo)
	.usingRecursiveComparison()
	.isEqualTo(frodo2)

// 🎉
```

If some fields are irrelevant for your search, you can tell AssertJ to ignore them:

```kotlin
data class Hobbit(val name: String, val yearOfBirth: Number)

val frodo = Hobbit("Frodo", 2968)
val frodo2 = frodo.copy(yearOfBirth = 2969)

assertThat(frodo)
  .usingRecursiveComparison()
  .isEqualTo(frodo2)

// java.lang.AssertionError: 
// Expecting:
//   <Hobbit(name=Frodo, yearOfBirth=2968)>
// to be equal to:
//   <Hobbit(name=Frodo, yearOfBirth=2969)>
// when recursively comparing field by field, but found the following difference:
// 
// field/property 'yearOfBirth' differ:
// - actual value   : 2968
// - expected value : 2969


assertThat(frodo)
  .usingRecursiveComparison()
  .ignoringFields("yearOfBirth")
  .isEqualTo(frodo2)

// 🎉
```

The object under test also doesn't have to be the same type as the expected object.
Just the content of the fields matter.
Also, AssertJ only cares about the set of fields present on the object being tested.
Additional fields in the expected object won't cause it to fail.

There's loads more to `usingRecursiveComparison()` and everything I've shown above is configurable. 
I recommend reading AssertJ's [Field by field recursion comparison](https://assertj.github.io/doc/#assertj-core-recursive-comparison) guide for more.

## Soft assertions

AssertJ has soft assertions.
These are great when you have tests that may fail in multiple places and you'd really like to know all of the failures at once.
Like for integration tests that have a reasonably long runtime.

Here's an example where I've used the `assertSoftly` static function to perform multiple assertions:

```kotlin
import org.assertj.core.api.SoftAssertions.assertSoftly

assertSoftly {
  it.assertThat(frodo.name)
    .isEqualTo("Samwise")

  it.assertThat(sam.name)
    .isEqualTo("Frodo")
}

// Multiple Failures (2 failures)
// -- failure 1 --
// Expecting:
//  <"Frodo">
// to be equal to:
//  <"Samwise">
// but was not.
// -- failure 2 --
// Expecting:
//  <"Samwise">
// to be equal to:
//  <"Frodo">
// but was not.
```

---

If you've been sleeping on AssertJ I really recommend that you give it a look.
I've loved writing tests in Hamcrest and I look forward to all the new tests I get to write in AssertJ.
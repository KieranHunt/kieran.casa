---
layout: post
title: "AssertJ's overridingErrorMessage must come first"
permalink: /error-overriding-message/
date: 2025-04-29 00:00:00 +0000
---


When an AssertJ's assertion fails, it's error messages are usually good enough.

```text
java.lang.AssertionError: 
Expecting ArrayList:
  ["Frodo", "Sam"]
to contain:
  ["Pippin"]
but could not find the following element(s):
  ["Pippin"]
```

But sometimes you might want to adjust the error messages. 

```kotlin
val frodo = new TolkienCharacter(name = "Frodo", age = 33, Race.HOBBIT);
val sam = new TolkienCharacter(name = "Sam", age = 38, Race.HOBBIT);

assertThat(frodo.getAge())
	.overridingErrorMessage("should be %s", frodo)
	.isEqualTo(sam)
```

```
java.lang.AssertionError: should be TolkienCharacter [name=Frodo, age=33, race=HOBBIT]
```

Here's a reminder:
**Always place the `.withFailMessage`/`overridingErrorMessage` call BEFORE any of the assertions.**

```kotlin
val frodo = new TolkienCharacter(name = "Frodo", age = 33, Race.HOBBIT);
val sam = new TolkienCharacter(name = "Sam", age = 38, Race.HOBBIT);

assertThat(frodo.getAge())
	.isEqualTo(sam)
	/* 🙅 Don't do this 🙅 */
	.overridingErrorMessage("should be %s", frodo)
```

AssertJ evaluates the assertions as it goes through the assertion chain.
If it finds a failing assertion, it throws the exception then and there.
If you haven't overridden the failure message yet, it'll use its default assertions.

Though this can be easy to forget, it does provide for some interesting syntax.
You can override multiple times in a chain if you want.

```kotlin
val frodo = new TolkienCharacter(name = "Frodo", age = 33, Race.HOBBIT);
val sam = new TolkienCharacter(name = "Sam", age = 38, Race.HOBBIT);

assertThat(frodo)
	.overridingErrorMessage("Frodo's age should be 33")
	.hasAge(33)
	.overridingErrorMessage("Frodo should be a hobbit")
	.isRace(Race.HOBBIT)
```


Read more about it on [2.5.4. Overriding error message](https://assertj.github.io/doc/#assertj-core-overriding-error-message) ([archive](https://archive.ph/8Mcl5)) in the AssertJ documentation.
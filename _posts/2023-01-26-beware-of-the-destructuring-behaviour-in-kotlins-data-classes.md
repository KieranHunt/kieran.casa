---
layout: post
title: "Beware of the destructuring behaviour in Kotlin’s data classes"
date: 2023-01-26 00:00:00 +0200
permalink: /kotlin-data-class-destructuring/
---

Don’t get me wrong, [Kotlin’s Data classes](https://kotlinlang.org/docs/data-classes.html) are super cool. If you’re not using them already, you really should be. With data classes you get:

- Automatic implementation of `equals` and `hashCode`,
- A workable `toString` function,
- A cool `copy` method for duplicating objects and updating its properties, and
- Destructuring syntax through `compotentN` function generation.

It’s that last point, about the destructuring syntax, that I’m a bit weary of. If you’re not already familiar, here’s how destructuring works for Kotlin data classes:

```kotlin
val lientjie = Cat("Lientjie", 2016)
val (name, yearOfBirth) = lientjie
println("$name, born in $yearOfBirth") 

// prints "Lientjie, born in 2016"
```

The order that the data class’s constructor parameters are defined is the order that those `compotentN` functions are generated.

What this means is that you can’t add a new constructor parameter to a data class unless either:

1. The new parameter is inserted last in the list, or
2. You’re very sure that no code depends on the class’s destructuring order

For example, if we were to extend the `Cat` class so that it accepted `numberOfVaccinations` as the second parameter, we’d introduce a subtle bug. All without a compiler warning.

```kotlin
val lientjie = Cat("Lientjie", 8, 2016)
val (name, yearOfBirth) = lientjie
println("$name, born in $yearOfBirth") 

// prints "Lientjie, born in 8" <- eek
```

I don’t think its a deal-breaker, especially for data classes that don’t leak into your code’s public contract, but certainly something to keep in mind.
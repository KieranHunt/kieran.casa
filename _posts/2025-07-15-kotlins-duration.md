---
layout: post
title: "Kotlin's Duration"
permalink: /kotlin-duration/
date: 2025-07-15
---

Just a quick note to say that Kotlin's Duration support awesome.

- ⏱️ **Extension properties for Double, Int, and Long**: 
Use something like `1.days` or `2.hours` to produce a Kotlin duration.
It's more expressive than Java's `Duration.ofDays(1)` or `Duration.ofhours(2)`.
- 📝 **Retrieve an ISO8601-compatible duration string**:
Call `toIsoString()` and you'll get something like `"PT1D"` or `"PT2H"`.
- 🔢 **Convert to whole milliseconds, seconds, etc**: 
Use properties like `inWholeMilliseconds` or `inWholeSeconds` to conver to `Long` representations when you need them.
- 📐 **Mathematical operations work how you'd expect**: `1.day + 2.hours + 3.minutes` does what you'd expect. So does `1.day > 2.hours`.

Reminds me a lot of [ActiveSupport](https://guides.rubyonrails.org/active_support_core_extensions.html#extensions-to-numeric-time) ([archive](https://archive.is/SVfGG#extensions-to-numeric-time)). For more, read [Duration's Companion](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/-duration/-companion/) ([archive](https://archive.is/R2eVW)) object or the [Duration](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/-duration/) ([archive](https://archive.is/raeL4)) class itself in the Kotlin documentation.
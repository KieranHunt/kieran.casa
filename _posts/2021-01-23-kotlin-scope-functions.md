---
layout: post
title: "How I use Kotlin Scope Functions to write better code"
date: 2021-01-23 00:00:00 +0200
permalink: /kotlin-scope-functions/
---

I write a mix of Java, Kotlin, Ruby and Typescript throughout my day. Of those, I've always found Ruby to be _the most_ eloquent.
I clearly remember my first few weeks of writing Ruby.
I wrote and re-wrote the same little program trying to find a style that clicked with me.
During that process I stumbled across [Enumerable](https://ruby-doc.org/core-3.0.0/Enumerable.html) mixin. I was hooked.

The Enumerable mixin is pretty simple on the surface. It adds a whole suite of helpful little methods to any collection class.
For a collection classes think: set, list, hash. By leaning on the Enumerable mixin we're able to write code like this:

```ruby
[ 3.1415, 2.7182, 1.6180 ]
  .reject { |number| number < 2 }
  .map { |number| number + 1 }
  .reduce(0) { |sum, number| sum + number }
# 7.8597
```

_Okay, but what does this have to do with Kotlin?_
Ruby's Enumerable mixin is great for working with items in a collection, but Ruby doesn't really offer anything for chaining functions to the overall object itself (more on `yield_self` in another post).

Enter Kotlin.
Kotlin has this concept of extension functions.
You can write them like this:

```kotlin
fun String.isFizz() = this == "fizz";

fun main() {
  println("fizz".isFizz())
  // ^^^ That prints 'true', of course.
}
```

Which, when written in Java, would look something like this:

```java
static boolean isFizz(string) {
  return string == "fizz";
}

public static void main(String[] args) {
  println(isFizz("fizz"));
}
```

Now that's pretty sweet but Kotlin actually comes with a few of these already built right in; available on any object.
They're known as the Kotlin Scope Functions.

From Kotlin's docs on [scope functions](https://kotlinlang.org/docs/reference/scope-functions.html):

💡 The Kotlin standard library contains several functions whose sole purpose is to execute a block of code within the context of an object.
When you call such a function on an object with a [lambda expression](https://kotlinlang.org/docs/reference/lambdas.html) provided, it forms a temporary scope.
In this scope, you can access the object without its name. Such functions are called scope functions.
There are five of them: `let`, `run`, `with`, `apply`, and `also`.

## Scope Functions

| Name    | Context Object Reference | Return Value  | Is extension function? |
| ------- | ------------------------ | ------------- | ---------------------- |
| `let`   | `it`                     | lambda result | ✓                      |
| `run`   | `this`                   | lambda result | ✓                      |
| `when`  | `this`                   | lambda result | ✗                      |
| `apply` | `this`                   | `this`        | ✓                      |
| `also`  | `it`                     | `it`          | ✓                      |

### let

`.let` is fantastic for replacing an object in a call chain.
In the following example, we replace the YAML `string` with the deserialised `MyClass` object.
We avoid the need to create an intermediary `myYAMLObject` before deserialisation.

```kotlin
val myObject: MyClass = """
    ---
    characters:
      - Tom
      - Dick
      - Harry
  """
    .trimIndent()
    .let { objectMapper.readValue(it, MyClass::class.java) }
```

### run

Run works a lot like `let`. It replaces the object in the call chain.
But expressions inside the `run` object work in the context of the object itself.
Think of it as you calling methods from within the object.

```kotlin
val sizeOfList = mutableListOf("Tom", "Dick")
  .run {
    append("Harry")
    size
  }

// sizeOfList = 3
```

### with

`with` works a lot like `run` except that it does not have a return value — so you can't use it in the context of a call chain.

```kotlin
with(listOf("Tom", "Dick", "Harry")) {
  println("The last element is ${last()}")
  println("There are $size elements")
}

// prints:
// The last element is Harry
// There are 3 elements
```

### apply

`.apply` is wonderful for configuring objects, especially those without builders.
In the following example, we're configuring an `ObjectMapper` in Jackson.
We can successively chain `.also` statements allowing us to call methods in the context of the object mapper.
With these chained `.also` expressions we can:

- Register the Kotlin Jackson module
- Allow JSON field names to be unquoted
- Ensure that extra field names don't cause deserialisation failures
- And configure the naming strategy to be kebab-cased.

```kotlin
val objectMapper = ObjectMapper(YAMLFactory())
  .apply { registerModule(KotlinModule()) }
  .apply { configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true) }
  .apply { configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false) }
  .apply { propertyNamingStrategy = PropertyNamingStrategy.KEBAB_CASE }
```

Writing this in Java we'd have to do something like this:

```java
ObjectMapper objectMapper = ObjectMapper(YAMLFactory());
objectMapper.registerModule(KotlinModule())
objectMapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true)
objectMapper.propertyNamingStrategy = PropertyNamingStrategy.KEBAB_CASE
```

Which might not seem so bad but imagine if we wanted it as a class-level variable.

```java
class YAMLMapper {
  private static final OBJECT_MAPPER = ObjectMapper(YAMLFactory())

  public static YAMLMapper() {
    OBJECT_MAPPER.registerModule(KotlinModule())
    OBJECT_MAPPER.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true)
    OBJECT_MAPPER.propertyNamingStrategy = PropertyNamingStrategy.KEBAB_CASE
  }
}

// 🤢
```

With the Kotlin example, we've managed to keep the initialisation _and_ configuration of the object together.

## also

`.also` is great for intercepting a call chain and adding some action.
I use it extensively to add logging, especially before returning from a method.

In the following example, I use `.also` to chain some logging calls to the end of an assignment call.
That way, my object is still assigned to the right value (`also` always returns `this`) and any additional information I want gets logged out.

```kotlin
val myObject = Files.readAllLines(someFilePath)
    .joinToString("\n")
    .let { mapper.readValue(it, MyClass::class.java) }
    .also { LOGGER.info("Successfully read the configuration file.") }
    .also { LOGGER.info("Path: $someFilePath") }
```

## How do you pick which scope function to use?

![](/assets/2021-01-23-scope-functions-decision-tree.png)

Personally, that means that I end up using `let` and `also` most of the time and `apply` only when I'm trying to replicate the builder pattern.

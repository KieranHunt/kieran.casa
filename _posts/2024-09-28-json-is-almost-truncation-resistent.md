---
layout: post
title: "JSON is (almost) truncation safe"
permalink: /json-truncation/
date: 2024-09-28 00:00:00 +0000
---

In YAML, you can't detect if a document has been truncated.

```yaml
my-favourite-things:
  - foo
  - bar
```

How do we know if the last `n` bytes of that document were cut off or not? 
What if `qux` was also one of my favourite things?
What if `bar` should've been `bar baz`?

JSON is mostly safe from this.
[A few posts ago](/will-it-json/), I showed how a JSON document doesn't have to start with an object.
In this post, we'll explore each type of JSON document and how how it fares with truncation.

> ✨ **This post is interactive** ✨<br/>
> Use the range sliders to truncate each JSON document and see errors from the JSON parser.

## `object`

{% include json-truncator.html json='{ "foo": "bar" }' id='object' %}

*An object's trailing `}`, which closes a corresponding `{`, protects against truncation.*

## `array`

{% include json-truncator.html json='[ "foo", "bar" ]' id='array' %}

*The array's trailing `]`, which closes a corresponding `[`, protects against truncation.*

## `string`

{% include json-truncator.html json='"foo bar baz"' id='string' %}

*Again, the unbalanced `"` will indicate truncation.*

## `"true"`, `"false"`, and `"null"`

{% include json-truncator.html json='true' id='true' %}

{% include json-truncator.html json='false' id='false' %}

{% include json-truncator.html json='null' id='null' %}

*These three behave in exactly the same way.*
*They're literals, so any missing characters will not parse.*

<br/>

## `number`

{% include json-truncator.html json='1337' id='number-integer' %}

{% include json-truncator.html json='3.1415926535' id='number-decimal' %}

{% include json-truncator.html json='2.998e8' id='number-exponential' %}

> 🚨 **JSON documents, where the document is just a `number`, are not truncation safe.** 🚨

<br/>

*Using the sliders above you can see that, for various levels of truncation, it's impossible to tell if the number has been truncated or not.*
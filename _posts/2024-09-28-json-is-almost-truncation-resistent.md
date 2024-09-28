---
layout: post
title: "JSON is (almost) truncation safe"
permalink: /json-truncation/
date: 2024-09-28 00:00:00 +0000
---

In YAML, you can't detect if a document has been truncated,

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
Let's go through the various types of JSON documents and see how they fare with truncation:

## `object`

```javascript
{
  "foo": "bar"
}
```

The trailing `}`, which closes a corresponding `{`, protects against truncation.

## `array`

```javascript
[
  "foo",
  "bar"
]
```

The trailing `]`, which closes a corresponding `[`, protects against truncation.

## `string`

```javascript
"foo"
```

Again, the unbalanced `"` will indicate truncation.

## `"true"`, `"false"`, and `"null"`

```javascript
true
```

```javascript
false
```

```javascript
null
```

These three behave in exactly the same way.
They're literals, so any missing characters will not parse.

## `number`

```javascript
1337
```

JSON documents, where the document is just a `number`, are **not** truncation safe.
In the example above, it's impossible to tell if that number should've been 1337 or something longer.
---
layout: post
title: "Will it JSON?"
date: 2023-11-09 00:00:00 +0000
permalink: /will-it-json/
---

It seems like a pretty common misconception that the only valid [JSON document](https://www.json.org/json-en.html) ([archive](https://archive.ph/2Ubnx)) is one who's top-most value is an object.
Maybe something like:

```javascript
{ // ← it has to start with this
  "foo": "bar",
  "baz": ["qux"]
}
```

But that's not true. The following are all valid JSON documents:

## `object`

```javascript
{ "foo": "bar" }

JSON.stringify({ "foo": "bar" });
// '{"foo":"bar"}'

JSON.parse('{"foo": "bar"}');
// Object { foo: "bar" }
```

## `array`

```javascript
["foo"]

JSON.stringify(["foo"]);
// '["foo"]' 

JSON.parse('["foo"]');
// Array [ "foo" ]
```

## `string`

```javascript
"bar"

JSON.stringify("bar");
// '"bar"' 

JSON.parse('"bar"');
// "bar"
```

## `number`

```javascript
100

JSON.stringify(100);
// '100' 

JSON.parse('100');
// 100
```

## `"true"`

```javascript
true

JSON.stringify(true);
// 'true' 

JSON.parse('true');
// true
```

## `"false"`

```javascript
false

JSON.stringify(false);
// 'false' 

JSON.parse('false');
// false
```

## `"null"`

```javascript
null

JSON.stringify(null);
// 'null' 

JSON.parse('null');
// null
```
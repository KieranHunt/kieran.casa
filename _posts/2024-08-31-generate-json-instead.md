---
layout: post
title: "Generating YAML? Generate JSON instead"
permalink: /generate-json-instead/
date: 2024-08-31 00:00:00 +0000
---

YAML is difficult. 
It's so difficult that certain YAML flaws have names. 
[The Norway Problem](https://hitchdev.com/strictyaml/why/implicit-typing-removed/) ([archive](https://archive.ph/y734B)) being the most infamous of them all.

Templating YAML is even more difficult. 
Whitespace is meaningful.
You've got to manage whitespace in your templating language and whitepsace in the YAML you're generating.

```erb
{- range ['foo', 'bar', 'baz'] }
  - { . } {# the space before the `-` on this line matters! }
{ end -}
```

In steps JSON.

JSON is a strict subset of YAML.
At least it has been since YAML 1.2 [back in 2009](https://en.wikipedia.org/wiki/YAML#Versions) ([archive](https://archive.ph/V8pFe#selection-2251.0-2251.8)).
Any valid JSON document is also a valid YAML document.

![]({{ "/assets/2024-08-31-yaml-superset-json.svg" | relative_url }})

So generate JSON instead.

```erb
<%=
require 'json'

[
  'foo', 
  'bar', 
  'baz'
].to_json
%>
```

And as always, [don't interpolate it](/dont-interpolate-json/).
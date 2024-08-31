---
layout: post
title: "Generating YAML? Generate JSON instead"
permalink: /generate-json-instead/
date: 2024-08-31 00:00:00 +0000
---

YAML is everywhere, from configuration files to data serialization formats. But if you've spent any time working with it, you've probably run into one of its many quirks. In fact, [people](https://ruudvanasseldonk.com/2023/01/11/the-yaml-document-from-hell) [love](https://hitchdev.com/strictyaml/why/implicit-typing-removed/) [to](https://news.ycombinator.com/item?id=21101695) [complain](https://www.reddit.com/r/programminghorror/comments/i0cnog/i_fucking_hate_yaml/) [about](https://github.com/cblp/yaml-sucks) [YAML](https://noyaml.com/).

But amidst all the frustration, it's easy to forget one key fact: YAML is actually a superset of JSON. That is, any valid JSON document is also valid YAML.

![]({{ "/assets/2024-08-31-yaml-superset-json.svg" | relative_url }})

At least it has been that way since YAML 1.2's release [back in 2009](https://en.wikipedia.org/wiki/YAML#Versions) ([archive](https://archive.ph/V8pFe#selection-2251.0-2251.8)).

YAML's flexibility comes at a cost: it can be prone to errors and misinterpretation, especially when it comes to indentation, special characters, and implicit typing. JSON, on the other hand, is straightforward and less error-prone.

I have one recommendation here to make working with generated YAML easier:

**If you need to generate YAML, and it's going to be read by a machine, just generate JSON instead.**

- **JSON is easier to generate**. Whatever programming environment you're running in probably already has a JSON generation library. Likely it's already in the standard library. 
- **JSON is less ambiguous**, which is crucial when generating machine-readable documents. For instance, YAML's implicit typing can lead to unexpected behavior—like interpreting certain strings as booleans ("yes" becomes true and "no" becomes false). JSON doesn't have this problem, as its syntax is stricter and more predictable.

And as always, [don't interpolate it](/dont-interpolate-json/). Interpolating strings into JSON can lead to errors and security vulnerabilities. Instead, use proper data structures and let your JSON library handle the serialization.

So, next time you need to generate YAML for a machine, save yourself some trouble and just generate JSON—it's simpler, safer, and gets the job done.
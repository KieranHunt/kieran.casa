---
layout: post
title: "How to write Markdown code blocks inside Markdown code blocks"
date: 2023-03-29 00:00:00 +0200
permalink: /markdown-in-markdown/
---

Recently, I needed to show off some [Markdown](https://daringfireball.net/projects/markdown/) ([archive](https://archive.ph/R0FEs)) source code _inside_ a Markdown [code block](https://daringfireball.net/projects/markdown/syntax#precode) ([archive](https://archive.ph/bfVtH#precode)).
To be precise, I wanted to include Markdown source code inside [fenced code blocks](https://www.markdownguide.org/extended-syntax#fenced-code-blocks) ([archive](https://archive.ph/b8ldF#fenced-code-blocks)).
Fenced code blocks weren't included in John Gruber's original Markdown spec but it seems like most Markdown processors have added support for them since.

For the most part, showing markdown source code inside a fenced code block is pretty easy.
You just write:

````markdown
```markdown
**This** works just fine.
```
````

But what happens when you you need to add a code block to that Markdown source code?
Wrapping the triple backticks (\`) in yet-more-triple-backticks isn't going to work as the Markdown processor won't understand where one block ends and the next one begins.
As long as there are more than three backticks, it turns out that most Markdown processors don't mind _how many_ backticks you use to delimit your code blocks.
So, **to write a Markdown code block inside a Markdown code block**, just differ the number of backticks in the outer and inner code blocks:

`````markdown
````markdown
**This** also works just fine.
Here's my example code:

```json
{
  "foo": "bar"
}
```
````
`````

For some extra spice, this blog is also written in Markdown.
So you may wonder how I've been writing these code blocks this whole time.
Peeling back the curtain reveals:

``````markdown
`````markdown
````markdown
**This** also works just fine.
Here's my example code:

```json
{
  "foo": "bar"
}
```
````
`````
``````

## Bonus

Markdown code blocks don't have to be delimited by backticks at all.
So if you're feeling fancy you could use triple tildes (~) instead:

`````markdown
~~~markdown
**This** also works just fine.
Here's my example code:

```json
{
  "foo": "bar"
}
```
~~~
`````
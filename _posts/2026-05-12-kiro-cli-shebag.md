---
layout: post
title: "OpenCode shebang"
permalink: /opencode-shebang/
date: 2026-05-12T12:33:31.740+01:00
---

Simon Willison wrote this [interesting piece](https://til.simonwillison.net/llms/llm-shebang) about using an llm in a script's shebang.
Here's an expansion of what he wrote but for OpenCode, written to a `.sh` file and given execuable permissions:

```bash
#!/usr/bin/env -S opencode run --dangerously-skip-permissions "follow the attached prompt" -f
Generate a limerick about a pelican riding a bicycle.
```

Running `./pelican.sh`:

```
> build · global.anthropic.claude-opus-4-7

A pelican perched on a bike,
Pedaled off on a lengthy-beaked hike.
With wings tucked in tight,
He was quite the sight,
Rolling through town—what a strike!
```

It still supports all of the parameters that OpenCode does:

```bash
./pelican.sh --model amazon-bedrock/global.anthropic.claude-sonnet-4-5-20250929-v1:0
```

And iterating:

```bash
./pelican.sh --ccontinue "now make more metal 🤘"
```

```
A pelican shredding on chrome,
Tore through the streets like a dome.
With talons on steel,
He thrashed every wheel,
Headbanging his way back to home!
```

It's not example 1 to 1 with Simon's implementation.
`llm -f` inlines file content as a prompt fragment; OpenCode's `-f` attaches a file. Functionally equivalent here, but opencode requires a non-empty positional `[message..]`, hence the `"follow the attached prompt"` directive.
For Simon's tool-call examples, OpenCode's tools are always available — you just need `--dangerously-skip-permissions` (or `-i` to allow approvals).

It's a pretty useful way of persisting a pre-canned prompt. Maybe as part of a `cron` job or in a [agent skill](https://skills.sh/)'s scripts directory.

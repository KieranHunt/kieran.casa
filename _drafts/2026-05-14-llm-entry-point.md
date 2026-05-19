---
layout: post
title: "Don't make LLMs the entry point of your automations"
permalink: /llm-entry-point/
date: 2026-05-14T12:24:23.946+01:00
---

A few days ago, I wrote about putting [OpenCode in a shebang](/opencode-shebang/).
I think an obvious place you may place something like that is in a `cron` job's target.
It sounds great in theory. 
Maybe something like what OpenClaw would do?

I tried it for real a few weeks ago.
I was on call at the time nursing a jam-packed ticket queue.
I thought it'd be nice to have a dashboard showing me a diff of all the ticket changes since I last checked.

The first time it ran was great.
It made a HTML dashboard, used Tailwind for styling 💅.

But I noticed a problem the second time it ran.
It had a completely different style.
A different layout.
A different idea of what was important to show.

But of course it did!
LLMs are non-deterministic.
Asking one to _"summarise the changes to my team's ticket queue"_ produces a different shape every time.

So I don't think the LLM should be the entry point of an automation.

## Scripts orchestrate, LLMs interpret

The split is straightforward:

- Anything that can be deterministic should be a script.
- Anything that needs interpretation at runtime should be an LLM call.

Fetching the changes for a ticket: code.
Summarising what those changes mean: LLM.

The script defines the structure.
The LLM fills in the bits that need judgement.

## A bad example

Say I want a daily report on metric breaches in my operations dashboard.
The lazy version looks like this:

```typescript
#!/usr/bin/env zx

const prompt = "review the operations dashboard and write a report on any metrics that have breached their thresholds";

await $`opencode run --dangerously-skip-permissions ${prompt}`;
```

A few things wrong with that:

- The LLM might skip breaches. _LLM laziness_ is real.
- The output's shape changes from run to run.
- The whole report — fetching, filtering, formatting, writing — is in the hands of a probabilistic system.
- There's nothing to read when it goes wrong.

## A better example

Move every step that doesn't need judgement back into code:

```typescript
#!/usr/bin/env zx
import fs from "fs/promises";

const breaches = await fetchBreaches();

const investigations = await Promise.all(
  breaches.map(async (breach) => {
    const prompt = `investigate this breach: ${JSON.stringify(breach)}`;
    const { stdout } = await $`opencode run --dangerously-skip-permissions ${prompt}`;
    return { breach, finding: stdout };
  })
);

const summaryPrompt = `summarise these investigations: ${JSON.stringify(investigations)}`;
const { stdout: summary } = await $`opencode run --dangerously-skip-permissions ${summaryPrompt}`;

await fs.writeFile("report.md", renderMarkdown({ investigations, summary }));
```

`fetchBreaches` is plain code — it hits CloudWatch (or wherever) and returns a known shape.
`renderMarkdown` is also plain code:

```typescript
const renderMarkdown = ({ investigations, summary }) => `
# Operations Report — ${new Date().toISOString().slice(0, 10)}

## Summary

${summary}

## Breaches

${investigations.map(({ breach, finding }) => `
### ${breach.metric}

- Threshold: ${breach.threshold}
- Observed: ${breach.value}

${finding}
`).join("\n")}
`;
```

Now the report has the same shape every day.
Each LLM call has one job — investigate _this_ breach, or summarise _these_ investigations — with a tight context window.
Coverage is guaranteed: a `for` loop won't get lazy and skip the third metric.

## Why this is better

- **Coverage.** Deterministic enumeration means nothing gets missed.
- **Quality.** Output quality scales inversely with how much each prompt has to produce.
- **Debuggability.** You can `cat` a script. You can't `cat` an agent's reasoning.
- **Tight contexts.** Each call gets only what it needs. No dumping the whole world into a single prompt.
- **Reproducibility.** The structure is yours, not the LLM's.

You'll probably make _more_ LLM calls this way.
Each one will be smaller, cheaper, and easier to reason about.
The trade is worth it.

## Where LLM-first is fine

Writing the script itself.
That work is interactive, conversational, exploratory — exactly what LLMs are good at.
But once the script is running on a cron, the LLM should be a function call, not the whole program.

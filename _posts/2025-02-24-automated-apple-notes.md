---
layout: post
title: "Automated daily Apple Notes"
permalink: /automated-apple-notes/
date: 2025-02-23 00:00:00 +0000
---

I have a simple approach to note taking.
Every day I make a new Apple Note.
The note is titled the current date.
ISO 8601 of course.
Today's note is titled {{ page.date | date: "%Y-%m-%d" }}.

I wanted Apple Shortcuts to automate this.
The idea was fairly simple:
- If today's note doesn't exist, create it and then open it.
- If it does exist, open it.

It turns out that Shortcuts is just smart enough to make that happen:

![Shortcut]({{ "/assets/2025-02-24-shortcut.webp" | relative_url }})

I think that counts as an [idempotent](https://en.wikipedia.org/wiki/Idempotence#Computer_science_meaning) ([archive](https://archive.ph/qRW4e#Computer_science_meaning)) Apple Shortcut... 🤓
And happily it works on both MacOS and iOS.

Find it @ [Open today's Apple Note](https://www.icloud.com/shortcuts/bd3d1822bbce4ca2b407ecd978d58680) on Apple Shortcuts.
---
layout: post
title: "Stop redirecting on unauthorized errors"
permalink: /unauthorized-redirects/
---

**Here's a scenario**:
1. A colleague on Slack sends you a link to some page they want you to check out. Maybe something like <http://example.com/some-resource.html>.
1. You click the link.
1. The backend decides that you don't have access to view `some-resource.html`.
1. It returns a redirect to <http://example.com/unauthorized.html>.
1. You read the error message that tells you that you don't have access to view that page.
1. You return to Slack and ask your colleague to grant you access.
1. They apologise and say that they've fixed it.
1. You return to your browser and refresh.
1. Still an unauthorized error.
1. You wonder if there's some eventual consistency in the system, maybe your colleague granted you access to the wrong page, or maybe they granted access to the wrong person.
1. You then realise that you're still at `unauthorized.html` (not the page you actually want) so you go back to Slack and click the link again.

Why do this?
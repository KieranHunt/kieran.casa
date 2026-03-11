---
layout: post
title: "Introducing CDK Search"
permalink: /introducing-cdk-search/
date: 2026-03-11T20:30:58.887+00:00
---

I've gotten pretty good at navigating the [CDK API Reference documentation](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-construct-library.html) ([archive](https://archive.ph/izYDt)). 
It's usually a two step process:
1. First, remember the name of the service that you're looking for. <kbd><kbd>⌘</kbd> + <kbd>f</kbd></kbd> for it on the docs page. I  usually remember to remove spaces and that its all lowercase. Then find it in the sidebar.
2. After that I expand that section of the sidebar (with my mouse 😱) and then <kbd><kbd>⌘</kbd> + <kbd>f</kbd></kbd> again for the Construct I'm looking for. Then I click on the link to go to the Construct's documentation.

To speed up this process, I've created [CDK Search](https://cdk-search.kieran.casa):

[![Screenshot of the CDK Search website]({{ "/assets/2026-03-11-cdk-search.png" | relative_url }})](https://cdk-search.kieran.casa)

It's a continously updated search index of all L1 and L2 CDK constructs found in [aws-cdk-lib](https://www.npmjs.com/package/aws-cdk-lib) ([archive](https://archive.ph/wip/ZdGFF)).
It's super fast, offline friendly* and supports keyboard navigation.

My workflow is now:
1. Go to [CDK Search](https://cdk-search.kieran.casa), type some portion of the construct's name. Press <kbd><kbd>⏎</kbd></kbd> to open the docs.

That's it.
It's a super focused experience.
I'd love to hear if you find it useful. 
Or even better, what you'd like to see added next.

<br/>

*<kbd><kbd>⌘</kbd> + <kbd>s</kbd></kbd> the page as HTML and you can view a (stale) offline copy any time!

---
layout: post
title: "Every AWS SDK Waiter"
permalink: /every-waiter/
date: 2025-11-19T19:00:45.712+00:00
---

I've just published a new repo containing every AWS SDK waiter, and its configuration. 
Find it @ [KieranHunt/aws-sdk-waiters](https://github.com/KieranHunt/aws-sdk-waiters) on GitHub. 

[![]({{ "/assets/2025-11-19-waiters.png" | relative_url }})](https://github.com/KieranHunt/aws-sdk-waiters)

To build that table, I'm relying on a technique I learned from [Simon Willison](https://til.simonwillison.net/github-actions/conditionally-run-a-second-job). 
It works as follows:
1. Using GitHub actions, run a workflow daily.
1. In the workflow, `git clone` the AWS SDK for Java repository.
1. Use a script to find all waiter files and compile a markdown table with their configuration. Make the script update the repo's README.
1. Back in the GitHub Action's worklow, commit the changes (if there are any) before pushing.

Read the entire workflow in [aws-sdk-waiters/.github/workflows/daily-aws-sdk-check.yml at main · KieranHunt/aws-sdk-waiters](https://github.com/KieranHunt/aws-sdk-waiters/blob/main/.github/workflows/daily-aws-sdk-check.yml) on GitHub.
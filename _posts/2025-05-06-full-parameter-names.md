---
layout: post
title: "--use --full --parameter --names"
permalink: /full-parameter-names/
date: 2025-05-06T14:54:14+01:00
---

This is just a quick PSA to say:

**If you're checking in code that contains scripts, and those scripts specify parameters, please use full parameter names.**

That is, instead of checking in code that looks like this:

```bash
# 🙅
curl 'https://kieran.casa/some/production/endpoint' \
	-X POST \
	-k \
	-L \
    -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' \
    -d 'msg1=wow&msg2=such&msg3=data'
```

Check in code that looks like this:

```bash
# 💃
curl 'https://kieran.casa/some/production/endpoint' \
	--request POST \
	--insecure \
	--location \
    --header 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' \
    --data 'msg1=wow&msg2=such&msg3=data'
```

Future you will be grateful when you don't have to remember obscure shortened parameter names. 
Who knows why `-k` means insecure?
And your teammates will thank you when they don't have to <kbd><kbd>⌘</kbd> + <kbd>⇥</kbd></kbd> between your code and the `man` page during reviews.

**Note**: While using full parameter names is best for clarity, be aware that some long options (and short options) differ between platforms (e.g., Linux vs. macOS, or Bash vs. PowerShell). Always check the documentation for your target environment.
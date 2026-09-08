---
layout: post
title: "Use mise for Raycast script commands"
permalink: /raycast-mise/
date: 2026-09-08T10:24:55+01:00
---

> "No, no, mise stay. Mise culled Jar Jar Binks. Mise your humble servant." 
> ~ Jar Jar Binks, referring to his Raycast setup

Okay so in [my last post](/bun-en-plus/) I alluded to using `mise` in my Raycast script commands.
I thought I'd take a little bit of time here to show you how I do that.

It's fairly simple, but there are some important caveats and compromises that I'll break down for you.
All of the complexity comes from getting your shebang line right.

The following is an example of running a mise-managed shell script via Raycast.

```sh
#!/usr/bin/env -S /Users/kieran/.local/bin/mise --cd /Users/kieran/Projects/aircast exec -- sh
```

- `/usr/bin/env`: See [How I start my Bash scripts](/starting-bash-scripts/) for this.
- `-S`: and this one too. 
- `/Users/kieran/.local/bin/mise`: This is where the `mise` bin is stored. Unfortuntely `env` won't expand `~` and Raycast doesn't put much on the `$PATH`. So we're forced to put the fully qualified path here. Which hurts portability a bit. This got me wondering, [what Raycast _does_ include in the `$PATH`](#what-does-raycast-put-on-the-path)?
- `--cd /Users/kieran/Projects/aircast`: `mise` needs to execute from inside the same directory as the `mise.toml` file. Again we don't get `~` expansion here so we have to hard-code the full path.
- [`exec`](https://mise.en.dev/cli/exec.html): Run a command with `mise`'s toolset.
- `sh`: The tool to run.

## What _does_ Raycast put on the path?

Here's the full output of `env` on MacOS 26.6.2 via a Raycast script command:

```sh
COMMAND_MODE=unix2003
HOME=/Users/kieran
LC_ALL=en-IE-u-ca-gregory-co-standard-cu-eur-fw-mon-hc-h23-ms-metric-tz-iedub
LOGNAME=kieran
LaunchInstanceID=A60487B2-5C1F-4DCE-A0C0-66C58A44274F
OLDPWD=/
OSLogRateLimit=64
PATH=/Users/kieran/bin:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/System/Cryptexes/App/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin:/pkg/env/global/bin:/Library/Apple/usr/bin:/usr/local/MacGPG2/bin:/Users/kieran/.cargo/bin
PWD=/
SECURITYSESSIONID= # redacted
SHELL=/bin/zsh
SHLVL=1
SSH_AUTH_SOCK= # redacted
SWIFT_UNEXPECTED_EXECUTOR_LOG_LEVEL=0
TMPDIR= # redacted
TZ=Europe/Dublin
USER=kieran
XPC_FLAGS=0x0
XPC_SERVICE_NAME=0
_=/usr/bin/env
__CFBundleIdentifier=com.raycast.macos
__CF_USER_TEXT_ENCODING=0x1F6:0x0:0x6C
```
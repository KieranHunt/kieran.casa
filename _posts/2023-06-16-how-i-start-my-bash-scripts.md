---
layout: post
title: "How I start my Bash scripts"
date: 2023-06-16 00:00:00 +0100
permalink: /starting-bash-scripts/
---

**2024-05-17**: I've updated this post to expand all `set` commands to their long versions.
Longer names are easier to grok at a glance and much easier to Google for.
I've also reordered them to set `xtrace` first to allow it to log out the other `set` commands.

```bash
#!/usr/bin/env bash

set -o xtrace
set -o errtrace
set -o errexit
set -o nounset
set -o pipefail

# ...
```

## `#!/usr/bin/env bash`

This is the _interpreter directive_ (or shebang).
Older Bash shebangs used to look something like `#!/bin/bash`.
But the `bash` executable might not be in `/bin` on all systems.
Portability isn't guarenteed.

[`env`](https://en.wikipedia.org/wiki/Env) ([archive](https://archive.ph/cklkn)) will search through the current `$PATH` for the interpreter.
It should be able to find `bash` even if it is somewhere other than `/bin`.

The drawbacks of using this approach seem to be:

- It's hard to pass additional parameters to the intepreter. Not all versions of `env` seem to support the `-S` argument needed for this. I can't recall having to do this for Bash, but have run into issues with [ts-node](https://typestrong.org/ts-node/docs/options) ([archive](https://archive.ph/d6Whp)) before.
- Just like `bash` may not be in `/bin`, `env` may not be in `/usr/bin`. I've never run into this in the wild though.

## `set -o ...`

The `-o` flag enables the particular shell option. Use `+o` to disable them.

- `xtrace` - Print each command before executing it, including expanding the value of arguments.
- `errtrace` - The `errexit` flag disables the `ERR` trap and `errtrace` re-enables it.
- `errexit` - Stop executing the script when a command fails. Vital.
- `nounset` - Stop executing the script when trying to access unset variables. Also vital.
- `pipefail` - Bash won't propogate non-zero exit codes to the end of a pipeline. This turns that on.

Most of the above options have shorter versions.
The `errtrace` option is `E`, `nounset` is `u`, etc.
For scripts that you expect others to read, and that includes future you, I recommend always using the long versions.

For more, see [Safer bash scripts with 'set -euxo pipefail' · vaneyckt.io](https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/) ([archive](https://archive.ph/jkfkS)) and [The Set Builtin section of the Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html#The-Set-Builtin) ([archive](https://archive.ph/hbdDf#The-Set-Builtin)).

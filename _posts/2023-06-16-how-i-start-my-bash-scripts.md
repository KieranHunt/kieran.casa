---
layout: post
title: "How I start my Bash scripts"
date: 2023-06-16 00:00:00 +0100
permalink: /starting-bash-scripts/
---

```bash
#!/usr/bin/env bash

set -Eeuxo pipefail

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

## `set -Eeuxo pipefail`

- `E` - The `e` command disables the `ERR` trap and `-E` re-enables it.
- `e` - Stop executing the script when a command fails. Vital.
- `u` - Error when trying to access unset variables.
- `x` - Print each command before executing it, including expanding the value of arguments.
- `o pipefail` - Bash won't propogate non-zero exit codes to the end of a pipeline. This turns that on.

For more, see [Safer bash scripts with 'set -euxo pipefail' · vaneyckt.io](https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/) ([archive](https://archive.ph/jkfkS)).
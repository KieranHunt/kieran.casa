---
layout: post
title: "bun-en-place shebang"
permalink: /bun-en-plus/
date: 2026-09-07T09:17:17+01:00
---

If you use mise-en-place to manage your dev tools (and you should), then you'll probably find this trick really handy. 
You can quite easily use mise and Bun in the shebang line for a TypeScript file, and then have it: version manage the runtime, in-memory transpile the TypeScript to JavaScript, and run the script. It'll do it all in one go:

```typescript
#!/usr/bin/env -S mise x bun@1.4.2 -- bun

const greet = (name: string): void => console.log(`hi ${name}`);

greet('kieran');

// hi kieran
```

Pretty cool.
I'm already using this trick in my [Raycast script commands](https://manual.raycast.com/script-commands).

The first time you run this script, if you don't already have the tool installed, mise will helpfully install it for you.
Mine installs into `~/.local/share/mise/installs/<tool>/<version>/`. 
Bun went to `~/.local/share/mise/installs/bun/1.4.2/bin/bun`.

You can also run it without a version number:

```typescript
#!/usr/bin/env -S mise x bun -- bun
```

And then mise will source the version number from your local `mise.toml` file.
This approach has some caveats though: you have to have a separate `mise.toml` file and you have to execute the script from the same directory as that file.

Bun has another trick up its sleeve. 
It'll auto-install dependencies when it finds no `package.json`:

```typescript
#!/usr/bin/env -S mise x bun@1.4.2 -- bun

import { z } from "zod";

const Pet = z.object({ name: z.string(), legs: z.number().int().min(0) });

const good: unknown = { name: "mochi", legs: 4 };
const bad: unknown = { name: "mochi", legs: -2 };

console.log(Pet.parse(good));
console.log(Pet.safeParse(bad).error?.issues[0].message);
```

And you _can_ even specify a version number for the zod import. 
Like this: `import { z } from "zod@^4";`.
However it seems like bun [has a bug](https://github.com/oven-sh/bun/issues/10411) at the moment whereby it fails if its package cache directory already contains a different version of the same dependency.
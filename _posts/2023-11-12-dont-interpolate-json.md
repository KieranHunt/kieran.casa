---
layout: post
title: "Don't interpolate JSON"
permalink: /dont-interpolate-json/
date: 2023-11-12 00:00:00 +0000
---

Consider a scenario where you need to produce JSON in an ERB template.
Instead of doing this:

```erb
{
  "foo": "bar",
  "baz": "<%= something %>"
  "gorp": "zarp"
}
```

Do this:

```erb
<%=
require 'json'

{
  foo: "bar",
  baz: something,
  gorp: "zarp"
}.to_json
%>
```

But why?

1. **Guaranteed Valid JSON:**
  Starting with a Ruby hash ensures the resulting JSON is valid, eliminating common errors like missing commas or mismatched quotes. 
  Did you notice that there's a missing trailing comma on the `"baz"` line?
1. **Build-Time Error Detection:**
  Syntax errors are caught at build time, offering an early warning that prevents issues from surfacing when the JSON is consumed.
1. **Prevention of Unintended JSON Escapes:**
  By directly referencing variables in the hash, there's no risk of unintentionally injecting invalid JSON due to escaping issues.
  In the first example, what if `something` returned `", "zarp": "garble`? The object will now have 4 items rather than 3. That's probably not how the author intended this to work.
1. **Reduced Templating Code:**
   Adopting this approach leads to cleaner code with fewer `<%=` and `%>` tags, enhancing readability and maintainability.
1. **Improved Syntax Highlighting:**
   The cleaner structure of using Ruby hashes typically results in better syntax highlighting support in code editors.
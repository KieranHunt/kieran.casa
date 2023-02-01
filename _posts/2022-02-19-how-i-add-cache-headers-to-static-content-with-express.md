---
layout: post
title: "How I add cache headers to static content with Express"
date: 2022-02-19 00:00:00 +0200
permalink: /how-i-add-cache-headers-to-static-content-with-express/
---

Express doesn’t ship with support for automatically adding cache headers. Cache headers mean that your user’s browser, or (if you have one) your CDN, won’t need to return back to your origin to fetch your content every time. If you have *static* content that’s definitely something you’d want. And that’s even more true if your static content ships with cache-busting file names. 

Anecdotally, I’ve seen Google Chrome report a page load time of 2.09 seconds ([DOMContentLoaded](https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event): 1.51 s, [Load](https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event): 1.8 s) **without** caching. With caching enabled Chrome reports 0.97 seconds to load the page (DOMContentLoaded: 0.75 s, Load: 0.96). That’s more than twice as fast. Your users will notice.

MDN (like usual) has an in-depth guide of cache headers and how they effect the user agent.

[Cache-Control - HTTP - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)

Here’s how I configure *my* caching. 

```tsx
import { RequestHandler } from "express";

/**
 * Set cache headers for an Express request.
 */
const setCacheHeaders: RequestHandler = async (req, res, next) => {

	// 👇 SETTINGS 👇

  // These are some convience functions for adding common headers.
  // Define your own if you need other values.

  const doNotCache = () => {
    res.setHeader("Cache-Control", "no-cache");
    next();
  };

  const cacheIndefinitely = () => {
    // 31557600 = 365.25 days
    res.setHeader("Cache-Control", "public, max-age=31557600");
    next();
  };

  const cacheForOneDay = () => {
    // 86400 seconds = 1 day
    res.setHeader("Cache-Control", "public, max-age=86400");
    next();
  };

  // 👇 RULES 👇

  if (req.method !== "GET") {
    // There's no reason to cache anything that's not a GET request.
    return doNotCache();
  }

  // A neat trick for enabling pattern matching in switch statements.
  switch (true) {

    // Files with cache-busting names.
    // CDNs and user-agents may cache these indefinitely.
    // Examples:
    // - /abc.9ad09f98.css
    // - /xyz.9ad09f98.js
    // - /k4l.744c8818.svg
    // - /l4j.f69400ca.css.map
    // - /lol.f69400ca.js.map
    case !!req.url.match(/^\/.*\.[a-z0-9]+\.(css|js|svg|css\.map|js\.map)$/g):
      return cacheIndefinitely();

    // Files that don't do cache busting, but can still be cached.
    // But we want to cache them a little bit since they won't change that often.
    // Example:
    //  - /some-cool-graphic.svg
    case !!req.url.match(/^\/some-cool-graphic\.svg$/):
      return cacheForOneDay();
  }

  // If all else fails to match, do not cache.
  // This is much safer than caching as the default case.
  return doNotCache();
};

export { setCacheHeaders };
```
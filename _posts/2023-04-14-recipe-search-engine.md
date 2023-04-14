---
layout: post
permalink: /recipe-search-engine/
title: Recipe search engine
date: 2023-04-14 00:00:00 +0200
---

<div class="bg-slate-50 text-slate-900 p-8 mb-16 rounded-xl">
  <p class="flex flex-wrap gap-x-1 subpixel-antialiased">
    <span class="whitespace-nowrap"><img class="w-5 inline grayscale rounded-full m-0 align-text-bottom" src="{{ '/assets/2023-04-14-americas-test-kitchen.webp' | relative_url }}"/> America's Test Kitchen,</span>
    <span class="whitespace-nowrap"><img class="w-5 inline grayscale rounded-full m-0 align-text-bottom" src="{{ '/assets/2023-04-14-bon-appetit.webp' | relative_url }}"/> bon appétit,</span>
    <span class="whitespace-nowrap"><img class="w-5 inline grayscale rounded-full m-0 align-text-bottom" src="{{ '/assets/2023-04-14-david-lebovitz.webp' | relative_url }}"/> David Lebovitz,</span>
    <span class="whitespace-nowrap"><img class="w-5 inline grayscale rounded-full m-0 align-text-bottom" src="{{ '/assets/2023-04-14-epicurious.webp' | relative_url }}"/> Epicurious,</span>
    <span class="whitespace-nowrap"><img class="w-5 inline grayscale rounded-full m-0 align-text-bottom" src="{{ '/assets/2023-04-14-food52.webp' | relative_url }}"/> Food52,</span>
    <span class="whitespace-nowrap"><img class="w-5 inline grayscale rounded-full m-0 align-text-bottom" src="{{ '/assets/2023-04-14-nyt-cooking.webp' | relative_url }}"/> NYT Cooking,</span>
    <span class="whitespace-nowrap"><img class="w-5 inline grayscale rounded-full m-0 align-text-bottom" src="{{ '/assets/2023-04-14-the-spruce-eats.webp' | relative_url }}"/> The Spruce Eats,</span>
    <span class="whitespace-nowrap"><img class="w-5 inline grayscale rounded-full m-0 align-text-bottom" src="{{ '/assets/2023-04-14-woolworths-taste.webp' | relative_url }}"/> Woolworths TASTE</span>
  </p>
  
  <form onsubmit="handleSubmit(event)" class="flex gap-x-4 mt-4 text-base" method="GET">
    <label for="recipe-search-query" class="sr-only">Search query</label>
    <input autofocus id="recipe-search-query" type="text" placeholder="Search for recipes…" class="w-full rounded-md border-0 bg-white/5 px-3.5 py-2 shadow-sm ring-1 ring-inset ring-slate-900/20 hover:ring-slate-400 focus:ring-slate-400 placeholder:text-slate-400 text-slate-900 outline-none subpixel-antialiased"/>
    <button type="submit" class="rounded-lg font-semibold py-3 px-4 bg-slate-900 text-white flex gap-x-1 items-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
        <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
      </svg>
      Search
    </button>
  </form>
</div>

<script>
  const handleSubmit = (e) => {
    e.preventDefault();

    const sites = [
      'www.americastestkitchen.com/recipes', 
      'www.bonappetit.com/recipe/', 
      'www.davidlebovitz.com',
      'www.epicurious.com/recipes/',
      'food52.com/recipes/',
      'cooking.nytimes.com/recipes/',
      'www.seriouseats.com',
      'www.thespruceeats.com',

      'taste.co.za/recipes/'
    ]
    const searchSuffix = sites.map(site => `site:${site}`).join(' || ');
    const searchQuery = `${document.querySelector('#recipe-search-query').value} ( ${searchSuffix} )`;

    const url = new URL("https://duckduckgo.com/");
    url.searchParams.append('q', searchQuery);
    url.searchParams.append(/* Full URLs */ 'kaf', '1');
    url.searchParams.append(/* Advertisements */ 'k1', '-1');

    window.location.href = url.href;
  }
</script>

---

Ben Tilden had [this clever idea](https://www.bentilden.com/recipe-search-engine) ([archive](https://archive.ph/cz2Oc)).
He created a custom Google search form that limits search results to specific recipe websites.
The website list includes sites like New York Times Cooking and Serious Eats.

Ben's raison d'être for the custom search engine was:

> [...] finding good recipes online can be surprisingly hard. One of the main problems is the sheer volume of information available. With so many websites, blogs, and recipe databases to choose from, it can be overwhelming.

> And then there’s quality control. Anyone can post a recipe online, regardless of their cooking experience or knowledge. You may—scratch that—you will come across recipes that are poorly written, inaccurate, or just don’t work.

I thought that was a really neat idea but I wanted to make a few changes to Ben's search engine:

1. I wanted to add my own recipe websites. Ben's list is good—it has many of the sites I usually reach for—but there are others I think should be included. Sites I've found helpful over the years.
1. I wanted it to use Duck Duck Go (DDG) for search. There's no need to give Google everyone's data unnecessarily.
1. ~~I wanted to avoid Javascript. DDG is pretty configurable through HTML forms and so why bother with JS?~~ Read below.

Ben used Google's [Programmable Search Engine](https://programmablesearchengine.google.com/) for his project.
It works by configuring a list of sites you want to search and then embedding a Google search box wherever it makes sense on your website.
Google lets you set multiple websites in the search list and supports basic wildcarding like `*.kieran.casa/*`.

Building a custom search engine on DDG turned out to be trickier than expected.
DDG allows you to customize a surprisingly large amount of the search experience.
Its [Params](https://help.duckduckgo.com/settings/params/) ([archive](https://archive.ph/JPmGH)) documentation lists all sorts of settings you can configure using URL query parameters. 
Did you know that you can turn off advertisements with the `k1` param?

Strangely absent from that documentation is the `sites` parameter.
This query parameter clearly exists (click on this search to see: <https://duckduckgo.com/?q=test&sites=kieran.casa>).
[And has been mentioned around the web](https://stackoverflow.com/a/7305734) ([archive](https://archive.ph/6SDgu)).
But at some point in the past lost the ability to filter for multiple different sites.
Or maybe it never had it?
Anyway, after a good few hours trying to send multiple domains through the `sites` query parameter I gave up.

So my solution then.
As I couldn't get a pure query parameter-based search form working, I had to resort to using Javascript to append a website filter to the search query.
It is certianly not the end of the world, but a bit of a pity nonetheless.

A special thanks to Ben for the original idea and to Pat Dryburgh for his help and handy [DuckDuckGo Search Box Generator](https://ddg.patdryburgh.com/) ([archive](https://archive.is/1Ehzs)).
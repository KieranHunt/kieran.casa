---
layout: post
title: "An Address for Every Star"
date: 2021-09-05 00:00:00 +0200
permalink: /an-address-for-every-star/
---

# An Address for Every Star

In the rather excellent *We Are Legion (We Are Bob)* - Dennis E. Taylor ([Goodreads](https://www.goodreads.com/book/show/32109569-we-are-legion-we-are-bob)), Bob jokingly says, "Hey, with IPv8, we should be able to address every galaxy in the universe." Given Bob's *situation* at the time, one would expect him to be able to work that out pretty quickly. But how right was he?

The European Space Agency (ESA) [estimates](https://www.esa.int/Science_Exploration/Space_Science/Herschel/How_many_stars_are_there_in_the_Universe) that there are between 10^11 and 10^12 galaxies in the universe. Since we're comparing numbers of stars to numbers of addresses on the internet, we should convert our number to a power of two. We're also stress-testing the internet protocol with this post, so we'll pick the upper bound of the ESA's estimation.

```
10^12  = 2^39.8631 ~= 2^40 galaxies in our universe.
```

The ESA continues with the estimate that there are also between 10^11 and 10^12 stars in our galaxy. We will then assume that our galaxy is pretty average—that is that all other galaxies contain the same-ish number of stars.

```
10^12 x 10^12 = 10^24 stars in our universe
```

Again, we convert that number to a power of two.

```
10^24 = 2^79.7263 ~= 2^80 stars in our universe
```

Since [IPv6 allocates 2^128 addresses](https://datatracker.ietf.org/doc/html/rfc8200), Bob won't even need to write the RFC for IPv8!
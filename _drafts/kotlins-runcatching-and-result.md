---
layout: post
title: "Kotlin's runCatching and Result"
permalink: /kotlins-runcatching-and-result/
---

Calling any method in Java can really return two different results:

1. The result you're expecting—modelled by the method's signature and probably what you're testing for.
1. An exception. A nasty exception that is life's way of reminding you that it exists.

Java has the concept of checked exceptions. 
Checked exceptions are little things that you add to your function signature like this:

```java
//                                                      vvv here
private static void checkedExceptionWithThrows() throws FileNotFoundException {
    File file = new File("non-existing-file.txt");
    FileInputStream stream = new FileInputStream(file);
}
```

Checked exceptions _force_ the calling function to either handle the exception (through a `try`/`catch`) it-itself declare a checked exception.
Anders Hejlsberg, the lead C# and TypeScript developer, [says that checked exceptions have two fatal flaws](https://www.artima.com/articles/the-trouble-with-checked-exceptions):
- **Versioning**: Adding a new checked exception to a method represents a backwards breaking change. 
As programmers are forced to handle the exception in the calling function, additions to a function's checked exception list will cause compile failure until the callers are updated.
- **Scalability**: If a programmer only chooses to deal with exceptions at the outside of their app, checked exceptions need to be bubbled all the way up.
This results in an every-growing list of checked exceptions being declared in a function's `throws` clause.

Java has these nasty things called checked exceptions. Checked exceptions _Unchecked_ exceptions are

Kotlin's `null` vs `Optional`

`Result`s should be dealt with as early as possible—rather let
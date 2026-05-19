Push as much of the assert J logic to the right as possible.

Instead of

```
assertThat(foo == 1).isTrue()
```

Write

```
assertThat(foo).isEqualTo(1)
```

```
assertThat(resolvedTargets)
    .extracting({ it.targetInformation()["arn"] })
    .containsExactlyInAnyOrderElementsOf(listOf(tuple(mrecTableArn), tuple("blah")))
```
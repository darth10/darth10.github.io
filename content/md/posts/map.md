{:title "A story about map"
 :date "2026-03-10"
 :layout :post
 :description "How Scala's definition of the map function got closer to the Haskell definition, and where it's headed next."}

In Haskell, `map` is defined as:

```haskell
map :: (a -> b) -> [a] -> [b]
```
<!--more-->

In other typed functional languages, such as OCaml, the definition is:

```ocaml
List.map : ('a -> 'b) -> 'a list -> 'b list
```

But in [Scala 2][scala-2-12], from 2.8 through 2.12, this is the signature of
`map` on `List`, as defined in the `TraversableLike` trait:

```scala
def map[B, That](f: A => B)(implicit bf: CanBuildFrom[Repr, B, That]): That
```

It returns `That`. What's `That`? Whatever `CanBuildFrom` decides it is.

The good news is that the [collections rework in Scala 2.13][scala-2-13] moved
away from `CanBuildFrom`, and [Scala 3][scala-3-6], which shares the same
collections library, kept the cleaner definition:

```scala
def map[B](f: A => B): List[B]
```

This definition overrides the more general version declared in `IterableOps`:

```scala
def map[B](f: A => B): CC[B]
```

Here, `CC` is the collection's type constructor.

The story doesn't end there, though. In the [Scala 3.8 docs][scala-3-8], where
the library is compiled with experimental [capture checking][cc], the signature
is already growing new appendages:

```scala
def map[B](f: A => B): CC[B]^{this, f}
```

[scala-2-12]: https://github.com/scala/scala/blob/v2.12.21/src/library/scala/collection/TraversableLike.scala#L279
[scala-2-13]: https://docs.scala-lang.org/overviews/core/collections-migration-213.html
[scala-3-6]: https://scala-lang.org/api/3.6.4/scala/collection/immutable/List.html#map-fffff812
[scala-3-8]: https://scala-lang.org/api/3.8.2/scala/collection/IterableOps.html#map-5d3
[cc]: https://docs.scala-lang.org/scala3/reference/experimental/cc.html

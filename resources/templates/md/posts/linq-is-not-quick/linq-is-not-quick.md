{:title "LINQ Is Not Quick"
 :date "2019-10-18"
 :layout :post-with-charts}

<script type="text/javascript" src="linq-is-not-quick/chart.js" defer></script>

Let me just say that I am not particularly a fan of either 
microbenchmarks or premature optimization. I also feel that
[LINQ](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/linq/introduction-to-linq-queries)
extensions are a fine addition to the .NET standard library. The LINQ query
syntax is also an integral part of the C# and F# languages. That being said,
there's an interesting and revealing tale to be told about the performance of
[LINQ to Objects](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/linq/linq-to-objects).

<!--more-->

LINQ provides a unified abstraction through a set of operations we can perform
over any collection. Regardless of the underlying concrete collection of a given
`IEnumerable<T>` object, we can invoke methods like `First` to
obtain the first element of the collection, or `Where` to filter out
elements that do not satisfy a supplied predicate. All of this sounds very
compelling, and yet the [contributing guidelines of the Roslyn compiler](https://github.com/dotnet/roslyn/blob/5addcdeec3f2c4dc99b07507ca4f558aa91a0586/CONTRIBUTING.md#csharp)
recommend avoiding the use of LINQ in _compiler hot paths_ where performance is
important.

Is LINQ really that bad for performance critical code? I thought I'd run a few 
benchmarks using [BenchmarkDotNet](https://github.com/dotnet/BenchmarkDotNet) to
find out on my own.

If we have a reasonably sized collection, we can find the first element in it
that matches a given predicate using the `First` extension method. For example,
in a collection of 100,000 integers, we can find the first element `i` such that
`i * 2` is equal to `100000` using `First` as shown below.

```csharp
List<int> itemsList = Enumerable.Range(0, 100000).ToList();

int result = itemsList.First(i => (i * 2) == 100000);
```

The imperative equivalent of using `First` like this would be a
combination of `for` and `if` statements. Since the collection we're
dealing with is a `List<int>` object, we can also use methods such as
`Find` and `FindAll` to achieve the same result. In fact, the
[LinqFaster](https://github.com/jackmott/LinqFaster) library wraps these methods
in the `FirstF` extension method.

Similarly, the `Select` and `Where` extension methods can be used to
filter and transform elements in a collection. For example, we can find elements
in the `itemsList` collection that are multiples of `10` and add `5` to them as
shown below.

```csharp
var results = itemsList
    .Where(i => i % 10 == 0)
    .Select(i => i + 5)
    .ToList();
```

Again, the same result can be obtained using some combination of `for` and `if`
statements. You could even use the `ToArray` and `CopyTo` methods to avoid
extra allocations. LinqFaster also provides the `WhereSelectF` method for this
exact pattern, which allows the LINQ query shown above to be written as 
`itemsList.WhereSelectF(i => i % 10 == 0, i => i + 5)`.

Let's benchmark the code shown above and also include results using arrays
instead of lists. The code and results of this comparison can be found in
[this repository](https://github.com/darth10/linq-performance). Here's a 
summary of the results.

```html
|                     Method |      Mean |     Error |    StdDev | Allocated |
|----------------------------|-----------|-----------|-----------|-----------|
|         IterativeFirstList | 153.39 us | 2.3878 us | 2.1167 us |         - |
|              LinqFirstList | 478.37 us | 4.2302 us | 3.7500 us |      40 B |
|        LinqFasterFirstList | 138.72 us | 1.0194 us | 0.9036 us |         - |
|                            |           |           |           |           |
|        IterativeFirstArray |  30.63 us | 0.0569 us | 0.0444 us |         - |
|             LinqFirstArray | 390.25 us | 7.4436 us | 7.3106 us |      32 B |
|       LinqFasterFirstArray | 138.69 us | 1.2221 us | 1.1431 us |         - |
|                            |           |           |           |           |
|   IterativeWhereSelectList |  497.2 us |  9.904 us |  9.264 us | 128.33 KB |
|        LinqWhereSelectList |  462.0 us |  8.960 us |  8.381 us | 128.48 KB |
|  LinqFasterWhereSelectList |  457.1 us |  3.676 us |  3.439 us | 128.33 KB |
|                            |           |           |           |           |
|  IterativeWhereSelectArray |  225.4 us |  4.192 us |  4.305 us | 167.41 KB |
|       LinqWhereSelectArray |  411.0 us |  3.993 us |  3.540 us |  103.8 KB |
| LinqFasterWhereSelectArray |  415.5 us |  3.324 us |  2.947 us | 429.73 KB |
```

<div id="postchart1" class="chart"></div>

The results show that using LINQ is slightly more performant than
imperative approaches in only one case. Even in this case, the difference in
performance is not really significant. LinqFaster also performs better than
LINQ, but is generally slower on arrays compared to imperative code.
In most cases however, imperative code is multiple times faster than LINQ. In
the comparison between LINQ and `for`/`if` statements to find the first element
matching a predicate in an array, LINQ is _13 times_ slower!

Since the differences highlighted are in microseconds, we're treading in
the territory of microbenchmarks. Also, all of the code used in these
comparisons is CPU-bound, while real-world applications typically use
more IO-bound code. In practice, the HTTP middleware of a web application could
have a much higher impact on overall performance than the usage of LINQ.

LINQ is definitely useful in performing a complex series of operations on a
given collection. This is essentially what LINQ provides - an abstraction of the
[iterator pattern](https://en.wikipedia.org/wiki/Iterator_pattern).
Of course, most data structures provide methods to efficiently use or traverse
them. For example, `List<T>` provides the `Find` and `FindAll` methods, and 
similarly `Dictionary<K, V>` has `ContainsKey` and `GetValueOrDefault`.

The real argument against using LINQ is that it lets developers disregard
choosing the right data structure to solve a problem. Avoiding LINQ can be
thought of as premature optimization, but using `First` instead of `[0]` to
obtain the first element of a list sounds more like _premature abstraction_. 
There's a great 
[quote by Linus Torvalds](https://softwareengineering.stackexchange.com/questions/163185/torvalds-quote-about-good-programmer) 
regarding the use of appropriate data structures.

> _"Bad programmers worry about the code._
_Good programmers worry about data structures and their relationships."_

Developers often conflate premature optimization with understanding performance
implications of certain features and writing code accordingly. Optimization
largely involves lots of measurements through profiling and even digging into
the generated IL or machine code if needed. There's practically no value to be
gained from guessing where your performance bottlenecks are. If you know that a
given method will be called frequently beforehand, it's definitely a good idea
to implement something reasonably performant at the first go. That's probably 
the reasoning behind the contributing guidelines of Roslyn, the C# compiler
itself, stating that LINQ should be avoided in certain places.

To be fair, LINQ isn't really a part of the C# or F# languages. It's an
assortment of extension methods in the standard library that you have to import
through `using System.Linq;`. Let's compare with Haskell, a language in which
`map` and `filter` are part of the core language constructs.

```haskell
items :: [Int]
items = [1..100000]

doSameThingAsFirst :: [Int] -> Int
doSameThingAsFirst xs = head $ filter (\i -> (i * 2) == 100000) xs
```

This code can be compiled using the `-O2` flag and benchmarked using the
[criterion](https://hackage.haskell.org/package/criterion) library.

```html
benchmarking doSameThingAsFirst/1
time                 180.8 μs   (179.2 μs .. 181.9 μs)
                     0.999 R²   (0.999 R² .. 1.000 R²)
mean                 180.3 μs   (179.2 μs .. 182.0 μs)
std dev              4.508 μs   (3.249 μs .. 7.936 μs)
variance introduced by outliers: 19% (moderately inflated)
```

<div id="postchart2" class="chart"></div>

Looks like the Haskell equivalent is slower than imperative C# code by a tiny
bit. It still performs significantly better than LINQ. So the next time you
spot a `using System.Linq;` statement in a program, you should think twice about
the problem you're trying to solve. There are definitely good reasons to use
LINQ, but performance shouldn't be one of them.

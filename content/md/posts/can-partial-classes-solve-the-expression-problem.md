{:title "Can partial classes solve the expression problem?"
 :date "2020-03-04"
 :layout :post
 :tags ["Solving the expression problem"]}

Programmers are always defining types and operations to use these types.
It's the essence of developing features in working software. The
_expression problem_<sup>[\[1\]](#ref-1)</sup> asks how easy it is to
define types and operations in a given programming language or paradigm, and is
stated as follows:

> _"The goal is to define a datatype by cases, where one can add new cases to_
_the datatype and new functions over the datatype, without recompiling existing_
_code, and while retaining static type safety (e.g., no casts)."_

<!--more-->

To elaborate, a set of definitions or abstractions can claim to have solved the
expression problem if it is possible to:
1. Add new _data types_, or simply _types_.
1. Add new _functions_, or _operations_ over the defined types.
1. Not recompile existing code while adding new types or operations.
1. Retain static type safety.

Programming languages generally provide several features to tackle the
expression problem. These features have their trade-offs, just like the
languages that provide them. Clojure, for example, has support for
[multimethods][multimethods] that allow us to define any number of polymorphic
functions that operate over a set of data types. Of course, Clojure is
dynamically typed, which doesn't meet the requirement of static type safety by
definition. On the other hand, most statically typed languages support
interfaces that can be implemented by multiple data types. However, such
implementations often make use of type casting, which is rather dubious for
static type safety.

As an example, let's say we're implementing 
_expression trees_<sup>[\[2\]](#ref-2)</sup>, which are used to represent
arithmetic expressions. A numeric literal can be represented by a `Const` type
and an `Add` type can represent an addition of two expressions. Let's define an
operation to evaluate the result of an expression. We'll call this operation
`Eval`. Now, without recompiling existing code or compromising type safety, is
it possible to make the following changes?
1. Add a new operation `View` to print an expression.
1. Add a new type `Mult` to represent multiplication of two expressions.

This seems simple enough; is it possible to implement a solution in C#? We could
define the types `Const` and `Add` to implement an interface `IExpr`. This
interface would define `Eval` as a method. This would make it easy to add a new
type `Mult`, but adding a new method `View` to the interface `IExpr` would
require changes to all existing types. So it's easy to add new types with this
approach, but adding new operations requires changing and recompiling existing
definitions.

Another approach would be to use multiple interfaces for different operations 
like `Eval` and `View`. These interfaces could then be 
[implemented explicitly][explicit-interfaces] in types like
`Const`, `Add` and `Mult`. However, this implementation would require type 
casting, which doesn't really maintain static type safety.

Let's try using [partial classes][partial-classes] to implement a solution.
Essentially, partial classes allow the definition of a single class to be spread
over multiple definitions or files through use of the `partial` qualifier.
Interfaces can also be defined using the `partial` qualifier.

Firstly, let's define the `IExpr` interface. This interface will declare a
single method `Eval`.

```csharp
public partial interface IExpr
{
    double Eval();
}
```

The types `Const` and `Add` can now be defined as partial classes that implement
this interface.

```csharp
public partial class Const : IExpr
{
    public double Value { get; }

    public Const(double value) =>
        Value = value;
}

public partial class Add : IExpr
{
    public IExpr Left { get; }
    public IExpr Right { get; }

    public Add(IExpr left, IExpr right) =>
        (Left, Right) = (left, right);
}
```

A `Const` expression is defined to wrap a single `double` value, and an `Add`
expression contains two properties `Left` and `Right` that are expressions
themselves. Of course, this code won't compile because the `Eval` method isn't
implemented in the `Const` and `Add` types. Let's implement this method in
separate definitions using `partial` as follows:

```csharp
public partial class Const
{
    public double Eval() => Value;
}

public partial class Add
{
    public double Eval() =>
        Left.Eval() + Right.Eval();
}
```

So, the `Eval` operation is now implemented by the `Const` and `Add` types.
Let's declare the `View` method in the `IExpr` interface by using a separate
`partial` definition.

```csharp
public partial interface IExpr
{
    string View();
}
```

Now, the compiler complains that the `Const` and `Add` types don't implement the
`View` method. Similar to how the `Eval` method was implemented, the `View`
method can be implemented in separate `partial` definitions as follows:

```csharp
public partial class Const
{
    public string View() =>
        Value.ToString();
}

public partial class Add
{
    public string View() =>
        $"({Left.View()} + {Right.View()})";
}
```

Great! We can add an operation without modifying the existing definitions of
`Const` and `Add`. If we had to implement a new type `Mult` to represent
arithmetic multiplication of two expressions, we can easily define `Mult` as a
partial class that implements the `IExpr` interface as follows:

```csharp
public partial class Mult : IExpr
{
    public IExpr Left { get; }
    public IExpr Right { get; }

    public Mult(IExpr left, IExpr right) =>
        (Left, Right) = (left, right);
}

public partial class Mult
{
    public double Eval() =>
        Left.Eval() * Right.Eval();
}

public partial class Mult
{
    public string View() =>
        $"({Left.View()} * {Right.View()})";
}
```

That was real easy! It was almost as easy as defining the `Const` and `Add`
types along with their implementations of `Eval` and `View`. In fact, it's easy
to define types and independent operations as partial classes because they're
actually _open classes_<sup>[\[3\]](#ref-3)</sup>.

It's worth noting that all definitions of a partial class are compiled into a
single class in a given assembly. So, it can be argued that adding new
definitions to an existing partial class causes recompilation of the entire
class. While this is definitely true, existing methods in the class will produce
the same compilation output as long as they haven't been modified. Partial
classes thus have the effect of not recompiling existing code.

To truly avoid recompilation of a partial class after adding a new definition,
the new definition would have to be in a different assembly. Unfortunately, this
is not really possible as one of the limitations of partial classes is that they
cannot span multiple assemblies or namespaces.

Despite these limitations, partial classes and interfaces can be used this way
to implement an adequate solution to the expression problem in C#.

The code in this post can be found [here][implementation-tree] along with 
[relevant tests][tests-tree].

#### References

1. <a name="ref-1" rel="nofollow" target="_blank"
   href="http://homepages.inf.ed.ac.uk/wadler/papers/expression/expression.txt">
   The Expression Problem</a> -  Wadler, Philip (1998).
1. <a name="ref-2" rel="nofollow" target="_blank"
   href="https://web.archive.org/web/20170119094603/http://www.brpreiss.com/books/opus5/html/page264.html">
   Expression Trees</a> -  Preiss, Bruno R. (1998).
1. <a name="ref-3" rel="nofollow" target="_blank"
   href="https://people.csail.mit.edu/dnj/teaching/6898/papers/multijava.pdf">
   MultiJava: Modular Open Classes and Symmetric Multiple Dispatch for Java
   </a> - Clifton, Curtis; Leavens, Gary T.; Chambers, Craig; Millstein, Todd
   (2000).

[multimethods]: https://clojure.org/reference/multimethods
[explicit-interfaces]: https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/interfaces/explicit-interface-implementation
[partial-classes]: https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/partial-classes-and-methods
[implementation-tree]: https://github.com/darth10/expression-problem/tree/master/csharp/PartialClasses 
[tests-tree]: https://github.com/darth10/expression-problem/tree/master/csharp/PartialClasses.Tests


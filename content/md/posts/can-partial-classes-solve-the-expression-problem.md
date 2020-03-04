{:title "Can partial classes solve the expression problem?"
 :date "2020-03-04"
 :layout :post
 :tags ["Solving the expression problem"]}

Programmers and programming language designers are always designing abstractions
over types and operations to work with these types. It's the essence of
developing features in working software. The _expression problem_<sup><a href="#ref1">[1]</a></sup>
asks how easy it is to define these abstractions in a given programming language
or paradigm, and is stated as:

> _"The goal is to define a datatype by cases, where one can add new cases to the_
_datatype and new functions over the datatype, without recompiling existing_
_code, and while retaining static type safety (e.g., no casts)."_

To solve the expression problem, you should:
1. Be able to add new _data types_, or simply _types_.
1. Be able to add new _functions_. These are also called _operations_ over the
   defined types.
1. Retain static type safety.
1. Not recompile existing code.

That seems simple enough. For example, let's say we're defining types and
operations to represent arithmetic expressions. A numeric literal can be
represented by a `Const` type and an `Add` type can represent an addition of two
expressions. Let's define an operation to evaluate the result of an expression.
We'll call this operation `Eval`. Now, how do we define these abstractions so
that it's possible to add a new operation `View` to print an expression? Also,
how easy would it be to add a new type `Mult` to represent multiplication? Does
adding these new types and operations require recompilation or remove type
safety from the solution?

TODO Clojure has [multimethods](https://clojure.org/reference/multimethods).

TODO [in Go](https://eli.thegreenplace.net/2018/the-expression-problem-in-go/).

Is it possible to implement a solution in C#? If we define the types `Const` and
`Add` to implement an interface `IExp`. This interface would define `Eval` as a
method. This would make it easy to add a new type `Mult`, but adding a new
method `View` in the interface `IExp` would require changes to all existing
types. So, it's easy to add new types with this approach, but it's not possible
to add new operations without changing and recompiling existing definitions.


TODO
[partial classes](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/partial-classes-and-methods)

TODO

```csharp
public partial interface IExpr
{
    double Eval();
}
```

TODO

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

TODO

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

TODO

```csharp
public partial interface IExpr
{
    string View();
}
```

TODO compiler errors now

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

TODO

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

TODO can be in separate files. Let's try it

```csharp
var a = new ...;

....Eval();
// => 20

....View();
// => ((7 * 2) + (2 * 3))
```

TODO _open classes_<sup><a href="#ref1">[2]</a></sup>


But, they cannot span multiple assemblies. Also, must be same namespace.

### References
1. <a id="ref1"
   href="http://homepages.inf.ed.ac.uk/wadler/papers/expression/expression.txt"
   target="_blank">
   The Expression Problem</a> -  Wadler, Philip (1998).
2. <a id="ref2"
   href="https://people.csail.mit.edu/dnj/teaching/6898/papers/multijava.pdf"
   target="_blank">
   MultiJava: Modular Open Classes and Symmetric Multiple Dispatch for Java
   </a> - Clifton, Curtis; Leavens, Gary T.; Chambers, Craig; Millstein, Todd (2000).


{:title "Can extension methods solve the expression problem?"
 :date "2020-03-14"
 :layout :post
 :tags ["Solving the expression problem"]}

Let's explore how [extension methods][extension-methods] in C# can solve the
_expression problem_. For an introduction to the expression problem, take a look
at [the previous post](../can-partial-classes-solve-the-expression-problem') in
[this series](../../tags/Solving%20the%20expression%20problem). Extension
methods are essentially used to define operations over a given type without
modifying the original definition of the type.

First, we define `IExpr` as a marker interface and implement it in the `Const`
and `Add` types. The implementation of `Const` and `Add` here is identical to
that in the previous post.

<!--more-->

```csharp
public interface IExpr { }

public class Const : IExpr
{
    public double Value { get; }

    public Const(double value) =>
        Value = value;
}

public class Add : IExpr
{
    public IExpr Left { get; }
    public IExpr Right { get; }

    public Add(IExpr left, IExpr right) =>
        (Left, Right) = (left, right);
}
```

The `Eval` operation is now defined as an extension method over the `IExpr`
type. The implementation of `Eval` here uses a `switch` expression. Note that 
the class containing this extension method may or may not be in the same
namespace as the `IExpr`, `Const` and `Add` types.

```csharp
public static class IExprExtensions
{
    public static double Eval(this IExpr e) => e switch {
        Const c => c.Value,
        Add a => a.Left.Eval() + a.Right.Eval(),
        _ => throw new NotImplementedException()
    };
}
```

The `View` operation is also defined as an extension method, but in a different
namespace.

```csharp
public static class IExprExtensions
{
    public static string View(this IExpr e) => e switch {
        Const c => c.Value.ToString(),
        Add a => $"({a.Left.View()} + {a.Right.View()})",
        _ => throw new NotImplementedException()
    };
}
```

Now, let's try adding a new `Mult` type that implements the `IExpr` interface.

```csharp
public class Mult : IExpr
{
    public IExpr Left { get; }
    public IExpr Right { get; }

    public Mult(IExpr left, IExpr right) =>
        (Left, Right) = (left, right);
}
```

Again, the definition of the `Mult` type is identical to that in the previous
post. However, the extension methods defined previously are not aware of this
type, and so new extension methods that wrap around the previous definitions
will be needed.

```csharp
public static class IExprExtensions
{
    public static double Eval(this IExpr e) => e switch {
        Mult m => m.Left.Eval() * m.Right.Eval(),
        _ => Operations.Eval.IExprExtensions.Eval(e)
    };
}

public static class IExprExtensions
{
    public static string View(this IExpr e) => e switch {
        Mult m => $"({m.Left.View()} * {m.Right.View()})",
        _ => Operations.View.IExprExtensions.View(e)
    };
}
```

While this does satisfy the compiler, the following code will raise an exception:

```csharp
var constExpr1 = new Const(7);
var constExpr2 = new Const(2);
var constExpr3 = new Const(3);

var multExpr1 = new Mult(constExpr1, constExpr2);
var multExpr2 = new Mult(constExpr2, constExpr3);

var addExpr = new Add(multExpr1, multExpr2);

addExpr.Eval();    // throws NotImplementedException 
```

This doesn't work as the `Eval` call above invokes the first extension method we
defined, which is still unaware of the `Mult` type. We're also overlooking an
important detail about `switch` expressions - they perform type casting at
runtime! This violates the type safety requirement of the expression problem and
unfortunately concludes that extension methods _cannot_ solve the expression
problem.

The code in this post can be found [here][implementation-tree] along with 
[relevant tests][tests-tree].

[extension-methods]: https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/extension-methods
[implementation-tree]: https://github.com/darth10/expression-problem/tree/master/csharp/Extensions
[tests-tree]: https://github.com/darth10/expression-problem/tree/master/csharp/Extensions.Tests

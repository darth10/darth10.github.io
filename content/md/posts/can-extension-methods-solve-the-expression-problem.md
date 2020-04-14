{:title "Can extension methods solve the expression problem?"
 :date "2020-03-14"
 :layout :post
 :tags ["Solving the expression problem"]}

TODO intro and previous post(s)

[Extension methods](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/extension-methods)
in C# can be used to defines operation over a given type without modifying the
definition of the type. Let's try to use extension methods over interfaces to
implement a solution to the expression problem. First, we define `IExpr`
as a marker interface and implement it in the `Const` and `Add` types.

TODO code, almost like we did before

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

TODO

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

TODO in a different namespace

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

TODO

```csharp
public class Mult : IExpr
{
    public IExpr Left { get; }
    public IExpr Right { get; }

    public Mult(IExpr left, IExpr right) =>
        (Left, Right) = (left, right);
}
```

TODO

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

TODO limitations as namespaces

```csharp
var a = new ...;

....Eval();    // throws NotImplementedException 

```

TODO doesn't work, also match performs type casting 

### References (?)
1. TODO

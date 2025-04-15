{:title "Can object algebras solve the expression problem?"
 :date "2020-03-28"
 :layout :post
 :tags ["Solving the expression problem"]}

Another way to [solve the expression problem](../../tags/Solving%20the%20expression%20problem) in C# and other
object-oriented languages is by using <i>object
algebras</i><sup>[\[1\]](#ref-1)</sup>. Object algebras define a parameterised
interface, and a factory that implements that interface.

First, let's define the interface of the `Eval` operation.

```csharp
public interface IEval
{
    double Eval();
}
```

Next, we define the `Const` and `Add` implementations of the `Eval` interface.

```csharp
public class ConstEval : IEval
{
    readonly double _value;

    public ConstEval(double value) =>
        _value = value;

    public double Eval() => _value;
}

public class AddEval : IEval
{
    readonly IEval _left, _right;

    public AddEval(IEval left, IEval right) =>
        (_left, _right) = (left, right);

    public double Eval() =>
        _left.Eval() + _right.Eval();
}
```

The object algebra interface `IExprAlgebra<T>` is where the actual `Const` and
`Add` types are defined. We can define a factory that implements the
`IExprAlgebra<T>` interface by supplying `IEval` as a type parameter.

```csharp
public interface IExprAlgebra<T>
{
    T Const(double value);
    T Add(T left, T right);
}

public class EvalFactory : IExprAlgebra<IEval>
{
    public IEval Const(double value) =>
        new ConstEval(value);

    public IEval Add(IEval left, IEval right) =>
        new AddEval(left, right);
}
```

We can now create the `Const` and `Add` types by calling the corresponding
methods of this factory. To add the `Mult` type, we simply implement the `IEval`
interface.

```csharp
public class MultEval : IEval
{
    readonly IEval _left, _right;

    public MultEval(IEval left, IEval right) =>
        (_left, _right) = (left, right);

    public double Eval() =>
        _left.Eval() * _right.Eval();
}
```

We also need to extend the object algebra interface to include the `Mult` type
and define a new factory that implements this interface. All of this doesn't
require any changes to the `EvalFactory` definition.

```csharp
public interface IMultExprAlgebra<T> : IExprAlgebra<T>
{
    T Mult(T left, T right);
}

public class MultEvalFactory : IMultExprAlgebra<IEval>
{
    readonly EvalFactory _evalFactory = new EvalFactory();

    public IEval Const(double value) =>
        _evalFactory.Const(value);

    public IEval Add(IEval left, IEval right) =>
        _evalFactory.Add(left, right);

    public IEval Mult(IEval left, IEval right) =>
        new MultEval(left, right);
}
```

Now we can instantiate this factory to use the `Mult` type with the `Eval`
operation.

```csharp
var factory = new MultEvalFactory();

IEval _constExpr1 = factory.Const(7);
IEval _constExpr2 = factory.Const(2);
IEval _constExpr3 = factory.Const(3);

IEval _addMultExpr = factory.Add(
    factory.Mult(_constExpr1, _constExpr2),
    factory.Mult(_constExpr2, _constExpr3));

_addMultExpr.Eval()    // => 20
```

To add a new operation, we create a new `IView` interface and implement it for
the `Const`, `Add` and `Mult` types.

```csharp
public interface IView
{
    string View();
}

public class ConstView : IView
{
    readonly double _value;

    public ConstView(double value) =>
        _value = value;

    public string View() =>
        _value.ToString();
}

public class AddView : IView
{
    readonly IView _left, _right;

    public AddView(IView left, IView right) =>
        (_left, _right) = (left, right);

    public string View() =>
        $"({_left.View()} + {_right.View()})";
}

public class MultView : IView
{
    readonly IView _left, _right;

    public MultView(IView left, IView right) =>
        (_left, _right) = (left, right);

    public string View() =>
        $"({_left.View()} * {_right.View()})";
}
```

We can now define a new factory using the existing `IMultExprAlgebra<T>`
interface by supplying `IView` as a type parameter.

```csharp
public class ViewFactory : IMultExprAlgebra<IView>
{
    public IView Const(double value) =>
        new ConstView(value);

    public IView Add(IView left, IView right) =>
        new AddView(left, right);

    public IView Mult(IView left, IView right) =>
        new MultView(left, right);
}
```

This factory is used just like the previous factories we defined.

```csharp
var factory = new ViewFactory();

IView _constExpr1 = factory.Const(7);
IView _constExpr2 = factory.Const(2);
IView _constExpr3 = factory.Const(3);

IView _addMultExpr = factory.Add(
    factory.Mult(_constExpr1, _constExpr2),
    factory.Mult(_constExpr2, _constExpr3));

_addMultExpr.View()    // => ((7 * 2) + (2 * 3))
```

The code in this post can be found [here][implementation-tree] along with
[relevant tests][tests-tree].

#### References

1. <a name="ref-1" rel="nofollow" target="_blank"
   href="https://www.cs.utexas.edu/~wcook/Drafts/2012/ecoop2012.pdf">
   Extensibility for the Masses</a> -  Bruno C. d. S. Oliveira and William R. Cook (2012).

[implementation-tree]: https://github.com/darth10/expression-problem/tree/master/csharp/ObjectAlgebras 
[tests-tree]: https://github.com/darth10/expression-problem/tree/master/csharp/ObjectAlgebras.Tests

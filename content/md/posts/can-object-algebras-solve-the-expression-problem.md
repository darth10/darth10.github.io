{:title "Can object algebras solve the expression problem?"
 :date "2020-03-10"
 :layout :post
 :tags ["Solving the expression problem"]}

TODO intro and previous post(s)

```csharp
public interface IEval
{
    double Eval();
}
```

TODO

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

TODO

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

TODO how to use this? (no code)

TODO how to add a new type

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

TODO

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

TODO inheritance, or even code duplication can be done

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

TODO adding a new operation

```csharp
public interface IView
{
    string View();
}
```

TODO

```csharp
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

TODO new factory, but new IExpr interface isn't needed

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

TODO

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

TODO

### References

1. TODO

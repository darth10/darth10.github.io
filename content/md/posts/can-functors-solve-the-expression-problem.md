{:title "Can functors solve the expression problem?"
 :date "2020-04-12"
 :layout :post
 :tags ["Solving the expression problem"]}

An elegant approach to [solve the Expression Problem](../../tags/Solving%20the%20expression%20problem) 
is to use _functors_ and _F-algebras_ to decompose expression types,
allowing us to add new variants and new operations easily through modules. The
goal is to define a data type by cases while being able to add both new variants
and operations without recompiling existing code, and while retaining static
type safety.

In Haskell, adding new operations over a fixed set of types is easily done by
writing a new function. But adding a new type variant to an existing data
type forces you to touch every function that pattern-matches on it. In
object-oriented languages the problem is actually reversed.

<!--more-->

We'll need two language extensions: `DeriveFunctor` to automatically derive
`Functor` instances for our expression nodes, and `TypeOperators` to write the
coproduct type `f :+: g` in infix notation.

```haskell
{-# LANGUAGE DeriveFunctor #-}
{-# LANGUAGE TypeOperators #-}
```

Instead of defining a monolithic expression datatype, we define each *kind* of
node as its own functor with the type variable `e`:

```haskell
data Const e = Const Double deriving Functor
data Add e = Add e e deriving Functor
```

`Const` holds a literal number and ignores `e` as it has no subexpressions.
`Add` holds two subexpressions. By deriving `Functor`, we get `fmap` for free,
which lets us transform the subexpressions inside each node.

Each functor describes the shape of one layer of an expression tree, but
doesn't give us recursive expressions. We recover recursion using a fixed point
of functors:

```haskell
data ExprF f = In (f (ExprF f))
```

Here, `ExprF f` is the _fixed point_ of the functor `f`. An expression is a node whose
children are themselves expressions. This is essentially the same idea as
[`Data.Fix`][data-fix] from the `data-fix` package, generalised to any functor.

To process such a recursive structure, we use a _fold_, which is sometimes
called a _catamorphism_. It collapses the tree bottom-up by applying an
*algebra* `f a -> a` at each node:

```haskell
foldExpr :: Functor f => (f a -> a) -> ExprF f -> a
foldExpr f (In t) = f (fmap (foldExpr f) t)
```

The `fmap (foldExpr f)` call recursively folds all the children, turning each
`ExprF f` into an `a`, before passing the resulting `f a` to the algebra `f`.
This is the F-algebra pattern - a function `f a -> a` is an algebra for the
functor `f` with carrier type `a`.

Now for the key trick that solves the expression problem.
We define a *coproduct* of two functors:

```haskell
infixr 7 :+:

data (f :+: g) e = Inl (f e) | Inr (g e) deriving Functor
```

A value of type `(f :+: g) e` is either an `f e` (injected on the left with
`Inl`) or a `g e` (injected on the right with `Inr`). This lets us build a
composite functor from smaller ones, and add new node types later simply by
extending the coproduct, without touching existing code.

Operations over expressions are defined as typeclasses on functors. 
Here's `Eval`, which evaluates an expression to a `Double`:

```haskell
class Functor f => Eval f where
  evalF :: f Double -> Double

instance Eval Const where
  evalF (Const x) = x

instance Eval Add where
  evalF (Add x y) = x + y

instance (Eval f, Eval g) => Eval (f :+: g) where
  evalF (Inl x) = evalF x
  evalF (Inr y) = evalF y
```

The coproduct instance is the key - if both `f` and `g` support `Eval`, then so does their coproduct `f :+: g`. 
This propagates automatically through arbitrarily deep coproducts. We then lift the algebra into a fold:

```haskell
eval :: Eval f => ExprF f -> Double
eval = foldExpr evalF
```

Let's define a concrete expression type using `Const` and `Add`, and some smart constructors:

```haskell
type Expr = ExprF (Const :+: Add)

const :: Double -> Expr
const x = In (Inl (Const x))

infixl 6 >+<

(>+<) :: Expr -> Expr -> Expr
x >+< y = In (Inr (Add x y))
```

These constructors handle the `Inl`/`Inr` injections, so call sites can be
oblivious to their existence. The type of `Expr` is essentially a tree where
each node is either a `Const` or an `Add`:

```
ExprF (Const :+: Add)
       ├── Inl (Const 7.0)
       └── Inr (Add
                 ├── Inl (Const 3.0)
                 └── Inl (Const 2.0))
```

We can now define a brand new operation `View` that renders expressions as
strings, without touching `Const`, `Add`, or `Eval`:

```haskell
class Functor f => View f where
  viewF :: f String -> String

instance View Const where
  viewF (Const x) = show x

instance View Add where
  viewF (Add x y) = printf "(%s + %s)" x y

instance (View f, View g) => View (f :+: g) where
  viewF (Inl x) = viewF x
  viewF (Inr y) = viewF y

view :: View f => ExprF f -> String
view = foldExpr viewF
```

Both `eval` and `view` now work on any expression type built from node functors
that implement the respective typeclass, while remaining completely open to
extension.

We can also add a new variant `Mult` for multiplication:

```haskell
data Mult e = Mult e e deriving Functor

instance Eval Mult where
  evalF (Mult x y) = x * y

instance View Mult where
  viewF (Mult x y) = printf "(%s * %s)" x y
```

We didn't touch `Eval`, `View`, `Const`, or `Add`. We just defined a new functor
and gave it instances. We can now extend `Expr` by simply widening the
coproduct:

```haskell
type Expr = ExprF (Const :+: Add :+: Mult)

const :: Double -> Expr
const x = In (Inl (Const x))

infixl 6 >+<

(>+<) :: Expr -> Expr -> Expr
x >+< y = In (Inr (Inl (Add x y)))

infixl 7 >*<

(>*<) :: Expr -> Expr -> Expr
x >*< y = In (Inr (Inr (Mult x y)))
```

The tree structure now has an extra level of nesting in the coproduct, which is
abstracted by the `>+<` and `>*<` constructors:

```
ExprF (Const :+: Add :+: Mult)
       ├── Inl           (Const)
       └── Inr ── Inl    (Add)
               └── Inr   (Mult)
```

There is one subtlety though: if you construct an expression without using the
smart constructors, GHC may not be able to infer the full type. For example:

```haskell
λ> let x1 = In (Inl (Const 7))
λ> :t x1
x1 :: ExprF (Const :+: g)
λ> eval x1
<interactive>:...: error:
    * Ambiguous type variable 'g0' arising from a use of 'eval'
      prevents the constraint '(Eval g0)' from being solved.
      ...
```

Because `Inl` only constrains the left side of the coproduct, `g` remains
ambiguous. The fix is to either annotate `x1 :: Expr`, or even better always use
constructors like `const`, which pin the full type. This is also why a function
like this works correctly:

```haskell
getAlgebra x
  | x < 10    = const 2.0
  | otherwise = const 4 >+< const 5
```

The inferred type is `(Ord a, Num a) => a -> Expr`, and the smart constructors
ensure the return type is unambiguous.

Now, with some constants defined:

```haskell
x1 = const 7
x2 = const 3
x3 = const 2
```

We can use both operations on expressions built from all three node types:

```haskell
λ> eval $ x1 >+< x2
10.0
λ> eval $ x1 >*< x3 >+< x2 >*< x3
20.0
λ> view $ x1 >+< x2
"(7.0 + 3.0)"
λ> view $ x1 >*< x3 >+< x2 >*< x3
"((7.0 * 2.0) + (3.0 * 2.0))"
```

By representing each expression variant as a functor and combining them with the
coproduct operator `:+:`, we get a solution to the expression problem that is
modular, type-safe, and composable.

The cost is some syntactic overhead, namely the `Inl`/`Inr` injections,
fixed-point wrapping with `In`, and the type inference subtlety around ambiguous
coproducts. Smart constructors abstract over most of this at call sites. This
approach, popularised by Swierstra's _Data Types à la Carte_<sup>[\[1\]](#ref-1)</sup>,
is one of the most principled solutions to the expression problem available in
Haskell.

The code in this post can be found [here][implementation-tree] along with 
[relevant tests][tests-tree].

#### References

1. <a name="ref-1" rel="nofollow" target="_blank" 
   href="https://www.cs.tufts.edu/comp/150FP/archive/wouter-swierstra/DataTypesALaCarte.pdf">
   Data Types à la Carte</a> -  Swierstra, Wouter (2008).

[data-fix]: https://hackage.haskell.org/package/data-fix-0.2.0/docs/Data-Fix.html
[implementation-tree]: https://github.com/darth10/expression-problem/blob/master/haskell/src/Functors.hs
[tests-tree]: https://github.com/darth10/expression-problem/blob/master/haskell/test/FunctorsTests.hs

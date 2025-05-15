{:title "Can typeclasses solve the expression problem?"
 :date "2020-04-03"
 :layout :post
 :tags ["Solving the expression problem"]}

_Typeclasses_ in Haskell roughly correspond to interfaces in object-oriented
languages and can be used to [solve the Expression Problem](../../tags/Solving%20the%20expression%20problem).
More specifically, since Haskell takes parametric polymorphism quite seriously,
typeclasses are more akin to generic interfaces, but also allow ad-hoc
polymorphism.

Let's first define an `Expr` typeclass with `const` and `add` as functions.
These functions represent types or variants in the Expression Problem.

```haskell
class Expr t where
  const :: Double -> t
  add :: t -> t -> t
```

Let's define the `Eval` operation as a type with `eval` as a field accessor.
This can be easily defined as an instance of `Expr`.

```haskell
newtype Eval = Eval { eval :: Double }

instance Expr Eval where
  const n = Eval n
  add x y = Eval $ eval x + eval y
```

We can define a value `e1` to test that `eval e1` produces the correct value.

```haskell
e1 :: Expr t => t
e1 = add (const 1)
         (add (const 2)
              (const 3))
```

`eval e1` returns `6.0` as expected. Next, let's define the `View` operation as
another type.

```haskell
import Text.Printf (printf)

newtype View = View { view :: String }

instance Expr View where
  const n = View $ show n
  add x y = View $ printf "(%s + %s)" (view x) (view y)
```

`view e1` returns the string `"(1.0 + (2.0 + 3.0))"`. We can now also add the
`Mult` operation by defining another typeclass `MultExpr` for it, and defining
instances of `Eval` and `View`.

```haskell
class MultExpr t where
  mult :: t -> t -> t

instance MultExpr Eval where
  mult x y = Eval $ eval x * eval y

instance MultExpr View where
  mult x y = View $ printf "(%s * %s)" (view x) (view y)
```

Now to use `MultExpr`, simply add another constraint to the polymorphic type
`t`.

```haskell
e2 :: (Expr t, MultExpr t) => t
e2 = mult (const 2)
          (add (const 2)
               (const 3))
```

This produces `10.0`. That's it! We've solved the Expression Problem using
typeclasses to represent data types.

Next, let's approach the problem by representing the operations in the
Expression Problem as typeclasses. We begin by defining `Const` and `Add`.

```haskell
data Const   = Const Double
data Add x y = Add x y
```

These types are used to create expressions, so let's define a typeclass for that
purpose.

```haskell
class Expr e

instance Expr Const
instance (Expr x, Expr y) => Expr (Add x y)
```

Next, we can define `Eval` as a typeclass with a single `eval` function, making
`Const` and `Add` instances of `Eval`.

```haskell
class (Expr e) => Eval e where
  eval :: e -> Double

instance Eval Const where
  eval (Const x) = x

instance (Eval x, Eval y) => Eval (Add x y) where
  eval (Add x y) = eval x + eval y
```

We can similarly define `View`.

```haskell
class (Expr e) => View e where
  view :: e -> String

instance View Const where
  view (Const x) = show x

instance (View x, View y) => View (Add x y) where
  view (Add x y) = printf "(%s + %s)" (view x) (view y)
```

Additionally, we can introduce a new data type `Mult` and make it an instance of
`Expr`, `Eval` and `View`.

```haskell
data Mult x y = Mult x y

instance (Expr x, Expr y) => Expr (Mult x y)

instance (Eval x, Eval y) => Eval (Mult x y) where
  eval (Mult x y) = eval x * eval y

instance (View x, View y) => View (Mult x y) where
  view (Mult x y) = printf "(%s * %s)" (view x) (view y)
```

But wait, there's an issue - the types aren't related in any meaningful way.
That means we can't define a function that composes `Const` and `Add` even
though they're instances of `Expr`.

```haskell
getAlgebra x
  | x < 10    = Const 2
  | otherwise = Add (Const 4) (Const 5)
```

The above function won't compile. 

```xml
* Couldn't match expected type ‘Const’
              with actual type ‘Add Const Const’
* In the expression: (Add (Const 4) (Const 5))
```

In fact, defining the expression `Add (Const 4) (Const 5)` itself won't work,
even if the constraint `Expr t => t` is applied.

```haskell
e1 :: Expr t => t
e1 = Add (Const 4) (Const 5)    -- fails compilation
```

Revisiting the approach of using typeclasses to represent data types in the
Expression Problem allows an easy definition of `getAlgebra`.

```haskell
getAlgebra x
  | x < 10    = const 2
  | otherwise = add (const 4) (const 5)
```

In conclusion, typeclasses can effectively solve the Expression Problem, but
only when they are used to represent data types. This ensures the relationships
between types are preserved and used correctly.

The code in this post can be found [here][implementation-tree] along with 
[relevant tests][tests-tree].

[implementation-tree]: https://github.com/darth10/expression-problem/blob/master/haskell/src/Typeclasses.hs
[tests-tree]: https://github.com/darth10/expression-problem/blob/master/haskell/test/TypeclassesTests.hs

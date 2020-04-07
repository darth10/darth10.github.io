{:title "Can functors solve the expression problem?"
 :date "2020-03-17"
 :layout :post
 :tags ["Solving the expression problem"]}

TODO

```haskell
{-# LANGUAGE DeriveFunctor #-}
{-# LANGUAGE TypeOperators #-}
```

TODO

```haskell
data Const e = Const Double deriving Functor
data Add e = Add e e deriving Functor
```

TODO

```haskell
data ExprF f = In (f (ExprF f))
```

TODO https://hackage.haskell.org/package/data-fix-0.2.0/docs/Data-Fix.html

```haskell
foldExpr :: Functor f => (f a -> a) -> ExprF f -> a
foldExpr f (In t) = f (fmap (foldExpr f) t)
```

TODO

```haskell
infixr 7 :+:

data (f :+: g) e = Inl (f e) | Inr (g e) deriving Functor
```

TODO

TODO

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

TODO

```haskell
eval :: Eval f => ExprF f -> Double
eval expr = foldExpr evalF expr
```

TODO example

```haskell
type Expr = ExprF (Const :+: Add)

const :: Double -> Expr
const x = In (Inl (Const x))

infixl 6 >+<

(>+<) :: Expr -> Expr -> Expr
x >+< y = In (Inr (Add x y))
```

TODO repl examples

TODO tree of types illustration 1

TODO add operation

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
view expr = foldExpr viewF expr
```

TODO add type

```haskell
data Mult e = Mult e e deriving Functor

instance Eval Mult where
  evalF (Mult x y) = x * y

instance View Mult where
  viewF (Mult x y) = printf "(%s * %s)" x y
```


TODO

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


TODO tree of types illustration 2

TODO REPL

```haskell
λ> let x1 = In (Inl (Const 7))
λ> :t x1
x1 :: ExprF (Const :+: g)
λ> eval x1
<interactive>:...: error:
    * Ambiguous type variable 'g0' arising from a use of 'eval'
      prevents the constraint '(Eval g0)' from being solved.
      Probable fix: use a type annotation to specify what 'g0' should be.
      These potential instances exist:
        instance [safe] (Eval f, Eval g) => Eval (f :+: g)
          -- Defined at ...
        instance [safe] Eval Add
          -- Defined at ...
        instance [safe] Eval Const
          -- Defined at ...
```

TODO can be resolved by annotating x1 with the correct type, let's use helper
function `const` instead. note and link to previous problem

```haskell
getAlgebra x
  | x < 10    = const 2.0
  | otherwise = const 4 >+< const 5
```

TODO `:t getAlgebra` will print `(Ord a, Num a) => a -> Expr`

TODO define some constants

```haskell
x1 = const 7
x2 = const 3
x3 = const 2
```

TODO

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

TODO conclusion

### References

1. TODO

{:title "Can typeclasses solve the expression problem?"
 :date "2020-03-14"
 :layout :post
 :tags ["Solving the expression problem"]}

TODO

```haskell
class Expr t where
    const :: Double -> t
    add :: t -> t -> t
```

TODO

```haskell
newtype Eval = Eval { eval :: Double }

instance Expr Eval where
    const n = Eval n
    add x y = Eval $ eval x + eval y
```

TODO

```haskell
e1 :: Expr t => t
e1 = add (const 1)
         (add (const 2)
              (const 3))
```

TODO `eval e1` produces `6.0`

```haskell
newtype View = View { view :: String }

instance Expr View where
    const n = View $ show n
    add x y = View $ printf "(%s + %s)" (view x) (view y)
```

TODO `view e1` produces `(1.0 + (2.0 + 3.0))`

```haskell
class MultExpr t where
    mult :: t -> t -> t

instance MultExpr Eval where
    mult x y = Eval $ eval x * eval y

instance MultExpr View where
    mult x y = View $ printf "(%s * %s)" (view x) (view y)
```

TODO

```haskell
e2 :: (Expr t, MultExpr t) => t
e2 = mult (const 2)
          (add (const 2)
               (const 3))
```

TODO

```haskell
getAlgebra x
  | x < 10    = const 2
  | otherwise = add (const 4) (const 5)
```


TODO operations as typeclasses

```haskell
data Const   = Const Double
data Add x y = Add x y
```

TODO

```haskell
class Expr e

instance Expr Const
instance (Expr x, Expr y) => Expr (Add x y)
```


TODO

```haskell
class (Expr e) => Eval e where
  eval :: e -> Double

instance Eval Const where
  eval (Const x) = x

instance (Eval x, Eval y) => Eval (Add x y) where
  eval (Add x y) = eval x + eval y
```

TODO add operation

```haskell
class (Expr e) => View e where
  view :: e -> String

instance View Const where
  view (Const x) = show x

instance (View x, View y) => View (Add x y) where
  view (Add x y) = printf "(%s + %s)" (view x) (view y)
```

TODO

```haskell
data Mult x y = Mult x y

instance (Expr x, Expr y) => Expr (Mult x y)

instance (Eval x, Eval y) => Eval (Mult x y) where
  eval (Mult x y) = eval x * eval y

instance (View x, View y) => View (Mult x y) where
  view (Mult x y) = printf "(%s * %s)" (view x) (view y)
```

TODO

```haskell
getAlgebra x
  | x < 10    = Const 2
  | otherwise = Add (Const 4) (Const 5)
```

TODO

```xml
* Couldn't match expected type ‘Const’
              with actual type ‘Add Const Const’
* In the expression: (Add (Const 4) (Const 5))
```

TODO

```haskell
e1 :: Expr t => t
e1 = Add (Const 4) (Const 5)    -- fails compilation
```

TODO conclusion

---
title: 'Exploring Haskell: Defining Functions'
date: 2018-09-01T23:04:15.566Z
description: 'Defining functions in Haskell.'
tags:
  - Haskell
  - Snippets
  - Beginner
image: '/img/exploring-haskell-defining-functions.png'
---

Going from conditional expressions and guarded equations to pattern matching, lambda expressions, and operator sections.

## Conditional Expressions

As in most programming languages, Haskell supports conditional expression, which also can be used to define a function.

```haskell
-- Absolute integer
abs :: Int -> Int
abs n = if n >= 0 then n else -n

-- Sign of integer
signum :: Int -> Int
signum n = if n < 0 then -1 else if n == 0 then 0 else 1
```

## Guarded Equations

Guarded equation is a preferred alternative to a conditional expression in Haskell.

```haskell
-- Absolute integer
abs :: Int -> Int
abs n | n >= 0    = n
      | otherwise = -n

-- Sign of integer
signum :: Int -> Int
signum n | n < 0     = -1
         | n == 0    = 0
         | otherwise = 1

-- When otherwise is unspecified the default value is otherwise = True
```

## Pattern Matching

Pattern matching is a simple way to define a function by matching a pattern with an expected result.

```haskell
-- Boolean negation
not :: Bool -> Bool
not False = True
not True  = False

-- Boolean AND (Naive)
(&&) :: Bool -> Bool -> Bool
True  && True  = True
True  && False = False
False && True  = False
False && False = False

-- Boolean AND (Compact)
(&&) :: Bool -> Bool -> Bool
True && True = True
_    && _    = False

-- _ is a wildcard to match any symbol

-- Boolean AND (Lazy)
(&&) :: Bool -> Bool -> Bool
True  && b = b
False && _ = False
```

Patterns are matched in order of definition, left to right, top to bottom.

```haskell
-- Will always return False
(&&) :: Bool -> Bool -> Bool
_    && _    = False
True && True = True
```

Patterns do not repeating arguments.

```haskell
-- Conflicting definition of b
(&&) :: Bool -> Bool -> Bool
b && b = b
_ && _ = False

-- Correct way is to use a guarded equation
(&&) :: Bool -> Bool -> Bool
b && c | b == c    = b
       | otherwise = False
```

## List Patterns

Internally, every non-empty list is constructed by repeated use of an operator `:` called _cons_ that adds an element to the start of a list.

```haskell
[1, 2, 3, 4]

-- is actually

1:(2:(3:(4:[])))
```

Function on a list can be defined using a `x:xs` pattern.

```haskell
-- Return the first element of a given list
head :: [a] -> a
head (x : _) = x

-- Return given list without the first element
tail :: [a] -> [a]
tail (_ : xs) = xs
```

- `x:xs` can only match non-empty lists.
- `x:xs` pattern must be inside parenthesis because of the order of operations.

## Lambda Expressions

A function can be constructed without naming the function by using a lambda expression.
For example: `λx -> x + x`.

The symbol `λ` is the Greek letter _lambda_ and in Haskell is denoted with a `\`.

### Usage of Lambda Expressions

Give formal meaning to a curried function.

```haskell
-- Without lambda expression
add :: Int -> Int -> Int
add x y = x + y

-- With lambda expression
add :: Int -> Int -> Int
add = \x -> (\y -> x + y)
```

Define a function that returns another function as a result.

```haskell
-- Without lambda expression
const :: a -> b -> a
const x _ = x

-- With lambda expression
const :: a -> (b -> a)
const x = \_ -> x
```

Avoid naming a function that is used once.

```haskell
-- Without lambda expression
odds :: Int -> [Int]
odds n = map f [0 .. n - 1] where f x = x * 2 + 1

-- With lambda expression
odds :: Int -> [Int]
odds n = map (\x -> x * 2 + 1) [0 .. n - 1]
```

## Sections

An operator written between its two arguments can be converted into a curried function written before its two arguments by using parenthesis.

```haskell
1 + 2 -- 3

(+) 1 2 -- 3

(1+) 2 -- 3

(+2) 1 -- 3
```

In general if `+` is an operator then functions of the form `(+)`, `(x+)`, `(+y)` are called sections.

### Using Sections

Sections can be used to instead of functions:

- `(+)` is the addition function `\x -> (\y -> x + y)`
- `(1+)` is the successor function `\y -> 1 + y`
- `(1/)` is the reciprocation function `\y -> 1 / y`
- `(*2)` is the doubling function `\x -> x * 2`
- `(/2)` is the halving function `\x -> x / 2`

And that's that.

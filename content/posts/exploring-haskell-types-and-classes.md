---
title: 'Exploring Haskell: Types & Classes'
date: 2018-08-30T21:28:36.362Z
description: 'Types, functions and classes in Haskell.'
tags:
  - Haskell
  - Snippets
  - Beginner
image: '/img/exploring-haskell-types-and-classes.png'
---

Code examples are adapted from [Introduction to Functional Programming](https://www.edx.org/course/introduction-functional-programming-delftx-fp101x-0) course.

Access to [GHCi](https://downloads.haskell.org/~ghc/latest/docs/html/users_guide/ghci.html) is available on [repl.it](https://repl.it/) to test out these snippets online.

## Types

Evaluating an expression `e`.

```haskell
e :: t -- This reads as e has type t, also used for type casting
```

Every valid expression has a type, which is calculated using _type inference_.

To get a type in GHCi use `:t` which is an abbreviation for `:type` command.

```haskell
not False -- True

:t not False -- not False :: Bool
```

### Basic Types

Some basic types that are common in other programming languages:

- `Bool` - logical values
- `Char` - single character
- `String` - strings of characters
- `Int` - fixed-precision integers
- `Integer` - arbitrary-precision integers
- `Float` - floating-point numbers

```haskell
:t True -- Bool - logical values

:t 'H' -- Char - single character
:t "Hi" -- [Char] - strings of characters

:t 1 -- Num p => p
2^64 :: Int -- is out of the Int range (Overflow)

:t 2^65 -- Num p => p
2^65 :: Integer -- 36893488147419103232

:t 1.5 -- Fractional p => p
```

### List Types

Lists in Haskell are polymorphic and can only contain a sequence of values with the same type.

```haskell
:t [False, True, False] -- [False, True, False] :: [Bool]

:t ['a', 'b', 'c', 'd'] -- ['a', 'b', 'c', 'd'] :: [Char]

:t [['a'], ['b', 'c']] -- [['a'], ['b', 'c']] -- :: [[Char]]
```

### Tuple Types

Tuples can contain sequence of values with different types

```haskell
:t (False, True) -- (False, True) :: (Bool, Bool)

:t (False,'a',True) -- (False, 'a', True) :: (Bool, Char, Bool)

:t ('a', (False, 'b')) -- ('a', (False, 'b')) :: (Char, (Bool, Char))

:t (True, ['a', 'b']) -- (True, ['a', 'b']) -- :: (Bool, [Char])
```

## Functions

A function is a mapping from values of one type to values of another type:

```haskell
import Data.Char (isDigit) -- Necessary for isDigit to work
:t isDigit -- isDigit :: Char -> Bool

:t not -- not :: Bool -> Bool

-- Example functions
add (x, y) = x + y -- add :: Num a => (a, a) -> a

zeroto n = [0..n] -- zeroto :: (Num a, Enum a) => a -> [a]
```

### Curried Functions

When a function returns as a result an another function it is called a _curried function_.

```haskell
add' x y = x + y -- add' :: Num a => a -> a -> a
```

Both `add` and `add'` produce the same result, where `add` takes all arguments at the same time, and `add'` can consume one at a time.

```haskell
-- Parenthesis in Haskell are right associative and are omitted for brevity.
mult x y z = x * y * z -- mult :: Num a => a -> (a -> (a -> a))
```

#### Why is Currying Useful?

Currying makes functions more flexible and allows _partial application_.

Creating a function that increments by one:

```haskell
addOne = add' 1
addOne 2 -- 3
```

### Conventions for Currying

To avoid excess parentheses when using curried functions there are two conventions:

1. The `->` in type definition associates to the _right_.

   ```haskell
   Int -> Int -> Int -> Int -- Int -> (Int -> (Int -> Int))
   ```

2. Function application is associated to the _left_.

   ```haskell
   mult x y z -- ((mult x) y) z
   ```

Unless explicitly required, all functions in Haskell are defined in the curried form.

## Polymorphic Functions

A function can be called polymorphic when its type contains one or more type variables

```haskell
-- length takes a 'collection' of type 'a' and returns an 'Int'
:type length -- length :: Foldable t => t a -> Int

length [False, True] -- 2
length [1, 2, 3, 4] -- 4

-- More Examples

:t fst -- fst :: (a, b) -> a

:t head -- head :: [a] -> a

:t take -- take :: Int -> [a] -> [a]

:t zip -- zip :: [a] -> [b] -> [(a, b)]

:t id -- id :: a -> a
```

## Overloaded Functions

A polymorphic function is called _overloaded_ if its type contains one or more class constraints.

```haskell
-- sum takes a list with numeric type 'a', and returns a value of type 'a'.
:t sum -- sum :: (Foldable t, Num a) => t a -> a

sum [1, 2, 3] -- 6
sum [1.1, 2.2, 3.3] - 6.6
sum ['a', 'b', 'c'] -- error
```

## Classes

Haskell has a number of type classes:

- `Num` - Numeric types
- `Eq` - Equality types
- `Ord` - Ordered types

```haskell
:t (+) -- (+) :: Num a => a -> a -> a

:t (==) -- (==) :: Eq a => a -> a -> Bool

:t (<) -- (<) :: Ord a => a -> a -> Bool
```

And that's it for now.

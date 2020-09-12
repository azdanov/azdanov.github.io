---
title: 'Exploring Haskell: Higher-order Functions'
date: 2018-09-09T08:56:56.567Z
description: 'Higher-order functions in Haskell.'
tags:
  - Haskell
  - Snippets
  - Beginner
image: '../../img/exploring-haskell-higher-order-functions.png'
layout: layouts/post.njk
---

Higher-order functions allow common programming patterns to be encapsulated as functions.

## Basic Concepts

A function that takes a function as an argument or returns a function as a result is called a higher-order function.
Because the term curried already exists for returning functions as results, the term higher-order is often just used for taking functions as arguments.

```haskell
twice :: (a -> a) -> a -> a
twice f x = f (f x)

twice (*2) 3 -- 12
twice reverse [1,2,3] -- [1,2,3]
```

## Processing Lists

The standard library defines a number of useful higher-order functions for processing lists.

```haskell
map :: (a -> b) -> [a] -> [b]
map f xs = [ f x | x <- xs ]
----
map :: (a -> b) -> [a] -> [b]
map f []= []
map f (x:xs) = f x : map f xs
----
map (+1) [1,3,5,7] -- [2,4,6,8]

map even [1,2,3,4] -- [False,True,False,True]

map reverse ["abc","def","ghi"] -- ["cba","fed","ihg"]
----
map (map (+1)) [[1,2,3],[4,5]] -- { applying the outer map }
↓
[map (+1) [1,2,3], map (+1) [4,5]] -- { applying the inner maps }
↓
[[2,3,4],[5,6]]
```

```haskell
filter :: (a -> Bool) -> [a] -> [a]
filter p xs = [ x | x <- xs, p x ]
----
filter :: (a -> Bool) -> [a] -> [a]
filter p [] = []
filter p (x : xs) | p x       = x : filter p xs
                  | otherwise = filter p xs
----
filter even [1..10] -- [2,4,6,8,10]

filter (> 5) [1..10] -- [6,7,8,9,10]

filter (/= ' ') "abc def ghi" -- "abcdefghi"
```

```haskell
all even [2,4,6,8] -- True
----
any odd [2,4,6,8] -- False
----
takeWhile even [2,4,6,7,8] -- [2,4,6]
----
dropWhile odd [1,3,5,6,7] -- [6,7]
```

## The foldr Function

Many functions that take a list as their argument can be defined using the following pattern of recursion on lists:

```haskell
f []     = v
f (x:xs) = x # f xs
```

The function maps the empty list to a value `v`, and any non-empty list to an operator `#` applied to the head of the list and the result of recursively processed tail.

For example:

```haskell
sum []       = 0
sum (x : xs) = x + sum xs
----
product []       = 1
product (x : xs) = x * product xs
----
or []       = False
or (x : xs) = x || or xs
----
and []       = True
and (x : xs) = x && and xs
```

The higher-order library function foldr (fold right) encapsulates this pattern of recursion for defining functions on lists.

Fold right function assumes that the given operator associates to the right: `1+(2+(3+0))`.

```haskell
foldr :: (a -> b -> b) -> b -> [a] -> b
foldr f v []       = v
foldr f v (x : xs) = f x (foldr f v xs)
----
sum :: Num a => [a] -> a
sum = foldr (+) 0
----
product :: Num a => [a] -> a
product = foldr (*) 1
----
or :: [Bool] -> Bool
or = foldr (||) False
----
and :: [Bool] -> Bool
and = foldr (&&) True
```

It is easier to reason about `foldr f v` in a non-recursive way, as simply replacing each `:` (cons) operator in a list by the function `f`, and the empty list at the end by the value `v`.

For example, applying the function `foldr (+) 0` to the list `1 : (2 : (3 : []))` gives the result `1 + (2 + (3 + 0))` in which `:` and `[]` have been replaced by `+` and `0`.

A quick reminder: `[1,2,3]` and `1 : (2 : (3 : []))` are equivalent.

Many functions can be redefined with `foldr`:

```haskell
length :: [a] -> Int
length []       = 0
length (_ : xs) = 1 + length xs
----
length [1,2,3]
↓
1 : (2 : (3 : []))
↓
1 + (1 + (1 + 0))
↓
3
----
length :: [a] -> Int
length = foldr (\_ n -> 1 + n) 0

----

reverse :: [a] -> [a]
reverse []       = []
reverse (x : xs) = reverse xs ++ [x]

reverse [1,2,3]
↓
1 : (2 : (3 : []))
↓
(([] ++ [3]) ++ [2]) ++ [1]
----
snoc x xs = xs ++ [x] -- cons backwards

reverse :: [a] -> [a]
reverse = foldr snoc []
```

## The foldl Function

Opposite of `foldr`, assumes that operator associates to the left: `((0+1)+2)+3`.

```haskell
foldl :: (a -> b -> a) -> a -> [b] -> a
foldl f v []       = v
foldl f v (x : xs) = foldl f (f v x) xs
```

It is useful for mapping the empty list to the accumulator value `v`, and any non-empty list to the result of recursively processing the tail using a new accumulator value obtained by applying an operator `#` to the current value and the head of the list.

```haskell
f v []     = v
f v (x:xs) = f (v # x) xs
```

When a function can be defined using both `foldr` and `foldl` the choice of which definition is preferable is usually based on efficiency and requires considering the evaluation mechanism of Haskell.

## The Composition Operator

The standard operator `.` returns the composition of two functions as a single function.

```haskell
(.) :: (b -> c) -> (a -> b) -> (a -> c)
f . g = \x -> f (g x)
----
odd n = not (even n)
odd = not . even
----
twice f x = f (f x)
twice = f . f
----
id :: a -> a
id = \x -> x
-- compose a list of functions
compose :: [a -> a] -> (a -> a)
compose = foldr (.) id
```

Continuing later on.

---
title: 'Exploring Haskell: Recursive Functions'
date: 2018-09-05T18:42:06.832Z
description: 'Recursive functions in Haskell.'
tags:
  - Haskell
  - Snippets
  - Beginner
image: '/img/exploring-haskell-recursive-functions.png'
---

In Haskell recursion serves as the basic mechanism for looping.

## Basic Concepts

It is possible to define a function which can call itself. This is the basic principle behind recursion.

```haskell
-- Without recursion
fac :: Int -> Int
fac n = product [1 .. n]

-- With recursion
fac :: Int -> Int
fac 0 = 1
fac n = n * fac (n - 1)

-- Which can be traced as:

fac 3 -- { applying fac }
↓
3 * fac 2 -- { applying fac }
↓
3 * (2 * fac 1) -- { applying fac }
↓
3 * (2 * (1 * fac 0)) -- { applying fac }
↓
3 * (2 * (1 * 1)) -- { applying * }
↓
6
```

Same for the multiplication function, which can be defined via multiple additions.

```haskell
(*) :: Int -> Int -> Int
m * 0 = 0
m * n = m + (m * (n - 1))

4 * 3 -- { applying * }
↓
4 + (4 * 2) -- { applying * }
↓
4 + (4 + (4 * 1)) -- { applying * }
↓
4 + (4 + (4 + (4 * 0))) -- { applying * }
↓
4 + (4 + (4 + 0)) -- { applying + }
↓
12
```

## Recursion on Lists

Previously mentioned `product` function can be defined with recursion.

```haskell
product :: Num a => [a] -> a
product []       = 1
product (n : ns) = n * product ns

product [2,3,4] -- { applying product }
↓
2 * product [3,4] -- { applying product }
↓
2 * (3 * product [4]) -- { applying product }
↓
2 * (3 * (4 * product [])) -- { applying product }
↓
2 * (3 * (4 * 1)) -- { applying * }
↓
24
```

Function `length` can be defined in a similar way.

```haskell
length :: [a] -> Int
length []       = 0
length (_ : xs) = 1 + length xs
```

Defining `reverse` can be done this way.

```haskell
reverse :: [a] -> [a]
reverse []       = []
reverse (x : xs) = reverse xs ++ [x]

reverse [1,2,3] -- { applying reverse }
↓
reverse [2,3] ++ [1] -- { applying reverse }
↓
(reverse [3] ++ [2]) ++ [1] -- { applying reverse }
↓
((reverse [] ++ [3]) ++ [2]) ++ [1] -- { applying reverse }
↓
(([] ++ [3]) ++ [2]) ++ [1] -- { applying ++ }
↓
[3,2,1]
```

And `++` operation.

```haskell
(++) :: [a] -> [a] -> [a]
[]       ++ ys = ys
(x : xs) ++ ys = x : (xs ++ ys)

[1,2,3] ++ [4,5] -- { applying ++ }
↓
1 : ([2,3] ++ [4,5]) -- { applying ++ }
↓
1 : (2 : ([3] ++ [4,5])) -- { applying ++ }
↓
1 : (2 : (3 : ([] ++ [4,5]))) -- { applying ++ }
↓
1 : (2 : (3 : [4,5])) -- { list notation }
↓
[1,2,3,4,5]
```

Here's a recursive function that inserts values to an ordered list.

```haskell
insert :: Ord a => a -> [a] -> [a]
insert x [] = [x]
insert x (y : ys) | x <= y    = x : y : ys
                  | otherwise = y : insert x ys

insert 3 [1,2,4,5] -- { applying insert }
↓
1 : insert 3 [2,4,5] -- { applying insert }
↓
1 : 2 : insert 3 [4,5] -- { applying insert }
↓
1 : 2 : 3 : [4,5] -- { list notation }
↓
[1,2,3,4,5]
```

Using previously defined function creating [insertion sort](https://en.wikipedia.org/wiki/Insertion_sort) becomes easy.

```haskell
isort :: Ord a => [a] -> [a]
isort []       = []
isort (x : xs) = insert x (isort xs)

isort [3,2,1,4] -- { applying isort }
↓
insert 3 (insert 2 (insert 1 (insert 4 []))) -- { applying insert }
↓
insert 3 (insert 2 (insert 1 [4])) -- { applying insert }
↓
insert 3 (insert 2 [1,4]) -- { applying insert }
↓
insert 3 [1,2,4] -- { applying insert }
↓
[1,2,3,4]
```

## Multiple Arguments

For example library function `zip` takes two lists and produces a list of pairs.

```haskell
zip :: [a] -> [b] -> [(a, b)]
zip []       _        = []
zip _        []       = []
zip (x : xs) (y : ys) = (x, y) : zip xs ys

zip ['a','b','c'] [1,2,3,4] -- { applying zip }
↓
('a',1) : zip ['b','c'] [2,3,4] -- { applying zip }
↓
('a',1) : ('b',2) : zip ['c'] [3,4] -- { applying zip }
↓
('a',1) : ('b',2) : ('c',3) : zip [] [4] -- { applying zip }
↓
('a',1) : ('b',2) : ('c',3) : [] -- { list notation }
↓
[('a',1), ('b',2), ('c',3)]
```

In a similar way the `drop` function is defined which removes a given number of elements from a list.

```haskell
drop :: Int -> [a] -> [a]
drop 0 xs       = xs
drop _ []       = []
drop n (_ : xs) = drop (n - a) xs
```

## Multiple Recursion

It is also possible to use recursive function multiple times.

```haskell
-- Get fibonacci at n-th positions
fib :: Int -> Int
fib 0 = 0
fib 1 = 1
fib n = fib (n - 2) + fib (n - 1)
```

[Quicksort](https://en.wikipedia.org/wiki/Quicksort) also demonstrates how multiple recursions occur inside a single function.

```haskell
qsort :: Ord a => [a] -> [a]
qsort []       = []
qsort (x : xs) = qsort smaller ++ [x] ++ qsort larger
  where
    smaller = [ a | a <- xs, a <= x ]
    larger  = [ b | b <- xs, b > x ]
```

## Mutual Recursion

Functions can also be defined recursively in terms of each other.

```haskell
even :: Int -> Bool
even 0 = True
even n = odd (n - 1)

odd :: Int -> Bool
odd 0 = False
odd n = even (n - 1)

even 4 -- { applying even }
↓
odd 3 -- { applying odd }
↓
even 2 -- { applying even }
↓
odd 1 -- { applying odd }
↓
even 0 -- { applying even }
↓
True
```

Another pair of functions `evens` and `odds` can be defined similarly.

```haskell
evens :: [a] -> [a]
evens []       = []
evens (x : xs) = x : odds xs

odds :: [a] -> [a]
odds []       = []
odds (_ : xs) = evens xs

evens "abcde" -- { applying evens }
↓
'a' : odds "bcde" -- { applying odds }
↓
'a' : evens "cde" -- { applying evens }
↓
'a' : 'c' : odds "de" -- { applying odds }
↓
'a' : 'c' : evens "e" -- { applying evens }
↓
'a' : 'c' : 'e' : odds [] -- { applying odds }
↓
'a' : 'c' : 'e' : [] -- { string notation }
↓
"ace"
```

## Advice on Recursion

As an example `product` function will be used during next steps.

1. define the type

```haskell
product :: [Int] -> Int
```

2. enumerate the cases

```haskell
product :: [Int] -> Int
product []       =
product (n : ns) =
```

3. define the simple cases

```haskell
product :: [Int] -> Int
product []       = 1
product (n : ns) =
```

4. define the other cases

```haskell
product :: [Int] -> Int
product []       = 1
product (n : ns) = n * product ns
```

5. generalize and simplify

```haskell
product :: Num a => [a] -> a
product []       = 1
product (n : ns) = n * product ns
```

Recursion is an important milestone to reach and understand. End.

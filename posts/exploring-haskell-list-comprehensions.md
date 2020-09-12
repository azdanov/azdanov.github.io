---
title: 'Exploring Haskell: List Comprehensions'
date: 2018-09-03T22:58:48.055Z
description: 'List comprehensions in Haskell.'
tags:
  - Haskell
  - Snippets
  - Beginner
image: '../../img/exploring-haskell-list-comprehensions.png'
layout: layouts/post.njk
---

List comprehensions allow defining of many functions on lists in a simple way.

## Basic Concepts

In mathematics, the comprehension notation can be used to construct new sets from existing sets.

For example, the comprehension `{x² | x ∈ {1..5}}` produces the set `{1, 4, 9, 16, 25}`.

A similar comprehension In Haskell:

```haskell
[x^2 | x <- [1..5]] -- [1,4,9,16,25]
```

The symbol `|` is read as such that, `<-` is read as is drawn from, and the expression `x <- [1..5]` is called a generator.

```haskell
[(x,y) | x <- [1,2,3], y <- [4,5]] -- [(1,4),(1,5),(2,4),(2,5),(3,4),(3,5)]

[(x,y) | y <- [4,5], x <- [1,2,3]] -- [(1,4),(2,4),(3,4),(1,5),(2,5),(3,5)]
```

The order of generators produces the same set of pairs, but arranged in different order.

Multiple generators are like nested loops, with later generators as more deeply nested loops, whose values change more frequently.

```haskell
[(x,y) | x <- [1..3], y <- [x..3]] -- [(1,1),(1,2),(1,3),(2,2),(2,3),(3,3)]
```

Later generator can depend upon values of earlier generators.

```haskell
concat :: [[a]] -> [a]
concat xss = [ x | xs <- xss, x <- xs ]

concat [[1,2], [3,4]] -- [1,2,3,4]
```

A more useful example of using list comprehensions.

```haskell
firsts :: [(a, b)] -> [a]
firsts ps = [ x | (x, _) <- ps ]

firsts [(1,2), (3,4)] -- [1,3]

length :: [a] -> Int
length xs = sum [ 1 | _ <- xs ]

length [1,2,3,4] -- 4
```

Wildcard pattern `_` can be used to discard a value from a list.

## Guards

A guard can be used to filter values produced by earlier generators.

If a guard is `True`, then the current value is retained, if it is `False` then it is discarded.

For example, the comprehension `[x | x <- [1..10], even x]` produces the list `[2,4,6,8,10]`.

```haskell
factors :: Int -> [Int]
factors n = [ x | x <- [1 .. n], n `mod` x == 0 ]

factors 15 -- [1,3,5,15]

factors 7 -- [1,7]
```

A function to find all the factors of an integer.

```haskell
prime :: Int -> Bool
prime n = factors n == [1, n]

prime 15 -- False

prime 7 -- True
```

Combining both functions to find if a integer is prime.

```haskell
primes :: Int -> [Int]
primes n = [ x | x <- [2 .. n], prime x ]

primes 40 -- [2,3,5,7,11,13,17,19,23,29,31,37]
```

Creating a list of primes by reusing the previous function.

```haskell
find :: Eq a => a -> [(a, b)] -> [b]
find k t = [ v | (k', v) <- t, k == k' ]

find 'b' [('a',1),('b',2),('c',3),('b',4)] -- [2,4]
```

Finds values by a key from a list of pairs.

## Zip Function

The library function zip produces a new list by pairing successive elements from two existing lists until either or both lists are exhausted.

```haskell
zip ['a','b','c'] [1,2,3,4] -- [('a',1),('b',2),('c',3)]
```

Notice that zip stops when one of the lists end is reached.

```haskell
pairs :: [a] -> [(a, a)]
pairs xs = zip xs (tail xs)

pairs [1,2,3,4] -- [(1,2),(2,3),(3,4)]
```

Zip function can be useful with list comprehensions.

```haskell
sorted :: Ord a => [a] -> Bool
sorted xs = and [ x <= y | (x, y) <- pairs xs ]

sorted [1,2,3,4] -- True

sorted [1,3,2,4] -- False
```

Checks if a list of elements is sorted.

```haskell
positions :: Eq a => a -> [a] -> [Int]
positions x xs = [ i | (x', i) <- zip xs [0 ..], x == x' ]

positions False [True, False, True, False] -- [1,3]
```

Finds all the positions of a provided value in a list.

## String Comprehensions

In Haskell a string is represented as a list of characters. Which allows to use any polymorphic list functions on a string.

```haskell
"abcde" !! 2 -- 'c'

take 3 "abcde" -- "abc"

length "abcde" -- 5

zip "abc" [1,2,3,4] -- [('a',1),('b',2),('c',3)]

count_lower :: String -> Int
count_lower xs = length [ x | x <- xs, x >= 'a' && x <= 'z' ]

count_lower "Haskell" -- 6

count :: Char -> String -> Int
count x xs = length [ x' | x' <- xs, x == x' ]

count 's' "Mississippi" -- 4
```

Over and out.

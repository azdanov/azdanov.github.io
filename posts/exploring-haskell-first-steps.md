---
title: 'Exploring Haskell: First Steps'
date: 2018-08-29T10:32:01.207Z
description: 'Basics in Haskell.'
tags:
  - Haskell
  - Snippets
  - Beginner
image: '../../img/exploring-haskell-first-steps.png'
layout: layouts/post.njk
---

The code samples are adapted from [Introduction to Functional Programming](https://www.edx.org/course/introduction-functional-programming-delftx-fp101x-0) course.

Best way to try these out is with [repl.it](https://repl.it/@azdanov/SardonicFoolishChapters) where [GHCi](https://downloads.haskell.org/~ghc/latest/docs/html/users_guide/ghci.html) is easily accessible.

```haskell
-- Basics
-- The -- is used for comments
2 + 3 * 4 -- 14
(2 + 3) * 4 -- 20

-- Alternative notation
(+) 2 ((*) 3 4) -- 14
(*) ((+) 2 3) 4 -- 20

-- sqrt is a standard library function
sqrt (3^2 + 4^2) -- 5.0

-- Anything in [] is a list which
-- differs from an array or a vector
head [1,2,3,4,5] -- 1
tail [1,2,3,4,5] -- [2,3,4,5]

-- Index from list at linear time
[1,2,3,4,5] !! 2 -- 3

take 3 [1,2,3,4,5] -- [1,2,3]
drop 3 [1,2,3,4,5] -- [4,5]

length [1,2,3,4,5] -- 5

sum [1,2,3,4,5] -- 15
product [1,2,3,4,5] -- 120

reverse [1,2,3,4,5] -- [5,4,3,2,1]

[1,2,3] ++ [4,5] -- [1,2,3,4,5]

-- Character
-- '' are used for single character
'H' -- Char

-- String
-- "" are used for a string
"Hi" -- [Char]

"Hel" ++ "lo" -- "Hello"
length "Hello" -- 5

-- Boolean
True -- True
False -- False

True || False -- True
not True && False -- False

-- Functions
double x = x + x -- Num a => a -> a
double 2 -- 4

quadruple x = double (double x) -- Num a => a -> a
quadruple 2 -- 8

factorial n = product [1..n] -- (Num a, Enum a) => a -> a
factorial 5 -- 120

-- f x y is equal to x `f` y
-- `ns` indicates a list which is simplified Hungarian notation
average ns = sum ns `div` length ns -- Foldable t => t Int -> Int
average [1,2,3,4,5] -- 3

-- Types

:t 1 -- 1 :: Num p => p
:t True -- True :: Bool
:t 'H' -- 'H' :: Char
:t "Hello" -- "Hello" :: [Char]

:t head "Hello" -- head "Hello" :: Char

:t length -- length :: Foldable t => t a -> Int

-- Tuples

(1, 2) -- (Num a, Num b) => (a, b)

(1, "Hello") -- Num a => (a, [Char])

(1, (2, 3)) -- (Num a1, Num a2, Num b) => (a1, (a2, b))

fst (1, "Hello") -- 1

snd (1, "Hello") -- "Hello"

:t fst -- (a, b) -> a
:t snd -- (a, b) -> b

fst (snd (1, (2, 3))) -- 2

-- That's all folks!
```

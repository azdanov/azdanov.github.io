---
title: 'The Journey Begins: Functional Programming'
date: 2018-08-26T08:51:39.976Z
description: 'Adopting a new language as a medium to learn functional programming.'
tags:
  - FP
  - Haskell
  - MOOC
image: '/img/journey-social.png'
---

For a while now I wanted to dive into _Functional Programming_ to properly learn how to use _functional-lite_ concepts in JavaScript. It took me some time to window shop for a language that I was satisfied with. The main criteria for me were language usage, popularity, ease of tooling and, most important, learning material. I didn't want to learn just the language, my goal was to learn functional programming and the language should be the medium.

I've looked at [Haskell](https://www.haskell.org/) and [Elm](https://elm-lang.org/). Considered [Scala](https://www.scala-lang.org/), [Clojure](https://clojure.org/), and [F#](https://fsharp.org/). Checked out [Racket](https://racket-lang.org/), [Lisp](https://common-lisp.net/), and [Scheme](<https://en.wikipedia.org/wiki/Scheme_(programming_language)>). And wondered about [OCaml](https://ocaml.org/) / [ReasonML](https://reasonml.github.io/) and [Erlang](https://www.erlang.org/). That's quite a list, and that's only scratching the surface.

![Choosing a language](/img/journey.png)

In the end, my choice fell on **Haskell** because of available learning materials and its purity. It would force me to learn how to properly use _functional programming concepts_ and not revert back to _imperative style_ while facing difficulties.

## Companions

- [Introduction to Functional Programming](https://www.edx.org/course/introduction-functional-programming-delftx-fp101x-0) - The main purpose of this course is to introduce a complete beginner to functional programming with help of Haskell. The language is not the main focus, the course is _free_ and in video format, just what I've been looking for.
- [Learn You a Haskell](http://learnyouahaskell.com/) - A _free_ book that was made with a beginner to functional programming in mind.
- [Real World Haskell](http://book.realworldhaskell.org/) - Another _free_ book that is good for beginners and intermediate Haskell enthusiasts.
- [Mostly Adequate Guide to FP](https://mostly-adequate.gitbooks.io/mostly-adequate-guide/) - This is an excellent and _free_ book that helps with learning how to apply functional programming concepts using JavaScript for daily usage.
- [Programming in Haskell](http://www.cs.nott.ac.uk/~pszgmh/pih.html) - I've heard good things about this book. Which is recommended by [Erik Meijer](https://www.edx.org/bio/erik-meijer), author of Introduction to Functional Programming course.
- [Haskell Programming from first principles](http://haskellbook.com/) - This book was recommended a lot during my online search. A potential buy.

## A Taste of Haskell

An quick example from [Introduction to Functional Programming](https://www.edx.org/course/introduction-functional-programming-delftx-fp101x-0) course to whet one's appetite for what's to come.

```haskell
-- Quicksort
f :: (Ord a) => [a] -> [a]
f []       = []
f (x : xs) = ys ++ [x] ++ zs
 where
  ys = f [ a | a <- xs, a <= x ]
  zs = f [ a | a <- xs, a > x ]
```

Beautiful.

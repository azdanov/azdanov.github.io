---
title: 'Refactoring for Fun and Profit: From TypeScript to Flow'
date: 2018-08-24T17:28:05.189Z
description: 'Why choosing proper tools for the job is important.'
tags:
  - TypeScript
  - Flow
  - Refactoring
image: '../../img/refactor-social.png'
layout: layouts/post.njk
---

Initially, I've built this website with TypeScript. During development, I neglected to follow the TDD methodology. Didn't do a thorough research of the eco-system. Had no solid goal of what should be the end-product. And in the end, had to rewrite everything from [TypeScript](https://www.typescriptlang.org/) in [Flow](https://flow.org/). Why? There are several points that helped me decide on this rather expensive process of refactoring the whole codebase.

## Decisions

- **Testing** - [The Jest testing framework](https://jestjs.io/) was made for JavaScript. Later on, community-created [babel-jest](https://github.com/facebook/jest/tree/master/packages/babel-jest) was made to support newest [ECMAScript](https://en.wikipedia.org/wiki/ECMAScript) syntax. For TypeScript, there is [ts-jest](https://github.com/kulshekhar/ts-jest), which work remarkably well. Later on, the babel-jest has been integrated into main Jest repository and remains officially supported, on the other hand, ts-jest, while having great contributors, is unofficial, and thus receives less love from Jest team, and has certain quirks. For me, it was _source-maps_ and _babel_.
- **Type Definitions** - [DefinitelyTyped](https://definitelytyped.org/) is incredible. How smoothly it integrates with [VSCode](https://code.visualstudio.com/). How fast and easy it is to use. There are thousands of types for all sorts of packages ready to be used. Flow, on the other hand, offers a more modest option: [flow-typed](https://github.com/flow-typed/flow-typed). Although it is well maintained, fewer people use flow and thus contribute less by creating type definitions and supporting existing ones. The issue for me was the nature of TypeScript itself, and how an error in an existing type definition propagates towards end-user. After updating dependencies I've had functioning code blow up on me with type errors due to minor changes in type definitions or even TypeScript itself, which started to drive me crazy. On the other hand Flow by its nature is more of an add-on than a language, with its opt-in behavior. It is much easier to circumvent such annoying behavior. And last but not least, Flow type definitions for React are created, used and supported for Facebook.
- **Gatsby** - Similar to Jest, [Gatsby](https://www.gatsbyjs.org/) is written in JavaScript, with some of its packages in Flow. Overall support for TypeScript exists, but it's, understandably, not the primary concern of Gatsby's team. I've had good experience developing in TypeScript, but issues with debugging, testing and type definitions started to accumulate, and resolution was not in sight. Whereas Flow's opt-in nature allows to freely switch from untyped JavaScript to strict Flow's syntax. It mattered a lot since at the time of the writing _Gatsby v2_ was in beta.

## Outcome

In the end, I'm glad that I've had to experience a complete refactoring process. This allowed me to learn a lot more about TypeScript and Flow, their eco-systems and what pro and cons each language have.

And by no means, one language is better than other. I love both TypeScript and Flow, and cannot imagine starting a new project without using one or the other. Tools and requirements can differ and to choose proper one's matter a lot. But static type-checking is a must.

![Goku and Vegeta fist bump](../../img/refactor.png)

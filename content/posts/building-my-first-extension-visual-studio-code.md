---
title: 'Building My First Extension: Visual Studio Code'
date: 2018-09-16T08:08:55.917Z
description: "How I've built and published my first vscode extension."
tags:
  - TypeScript
  - VSCode
  - Project
image: '/img/extension-social.png'
---

Building an extension at first seemed like a daunting task. There are so many new things to consider: Tooling, Testing, API, CI, CD and so on. And last but not least, what extension idea to realize. There are already so many amazing extensions out there, with great functionality. At first, it may seem impossible to build a similarly useful product. It is important to remember that everyone started in the same spot, and it took many months and community contributions to get to where they are now. It is useful about this process as a bunch consecutive layers on top of one another.

![Extension](/img/extension.png)

## Points of Interest

The easiest way to start is to find an existing extension and read the source while referencing the official [VSCode API](https://code.visualstudio.com/docs/extensionAPI/vscode-api) overview. There are numerous simple extension projects out there: [hello-world](https://code.visualstudio.com/docs/extensions/example-hello-world), [word-coung](https://code.visualstudio.com/docs/extensions/example-word-count), [duck-generator](https://github.com/vanister/duck-generator) and for more advanced cases [language-server](https://code.visualstudio.com/docs/extensions/example-language-server). And it is always useful to dig into similar projects. For example, if I want to build a spell checker it would be prudent to find any existing ones, read the code, find what is good, what is bad, how some problems are solved and is there a way to improve. It is even possible to abandon the idea of building an extension an instead contribute to the found project.

## Words of Encouragement

Any new endeavor is scary. In a way, one might feel like a maritime explorer from the 15th century who is preparing for a voyage to unexplored lands. What motivates me is the feeling of discovering new things, exploring new ideas and perfecting my craft. So by focusing on the positive and ignoring the negative in such cases is necessary to progress further.

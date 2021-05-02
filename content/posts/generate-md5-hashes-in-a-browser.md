---
title: 'Generating MD5 Hashes in a Browser'
date: 2019-03-08T08:40:51.210Z
description: 'How to generate MD5 hashes for all images inside of a browser.'
tags:
  - JavaScript
  - Browser
  - Trivia
image: '/img/study.png'
---

One day I stumbled upon an interesting question: "How to generate a list of hashes for all the page images inside the browser?". It got me intrigued about how versatile JavaScript actually is. Thus here are the result of that endeavor.

## Prelude

I will be using https://picsum.photos/ since there are no CORS issues. For any other website an extension/flag might be required to disable CORS protection inside the browser.

For the MD5 library there are many choices, through trial and error I've selected https://github.com/emn178/js-md5/. The most common issue with others was lack of support for `ArrayBuffer` which resulted in incorrect hash values.

## Loading an External Package

While this might sound daunting at first, it's not that bad. Most packages can be executed inside the browser without any compilation via babel/webpack.

Inside the browser console it is done by creating a `script` element and adding a source to the script file. In our case the source will be https://cdn.jsdelivr.net/npm/js-md5@0.7.3/src/md5.min.js.

```js
var script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/js-md5@0.7.3/src/md5.min.js';

document.querySelector('head').appendChild(script);
```

If there were no CORS issues then an `md5` function will be available inside the terminal.
_Note:_ this can also be used to require `jQuery` or similar libraries to do some DOM heavy lifting.

## Getting the Sources

Next it is necessary to find all the image sources on the page. With `ES6` it is a trivial task.

```js
var imgs = [...document.querySelectorAll('img')];
var imgSrcs = imgs.map((i) => i.src);
```

## Preparing to Fetch

Now that `imgSrcs` array has all the sources a function is needed to fetch each source, and convert it into a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob). Also this blog object must be converted into an [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer). Most modern browsers have [FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) API that facilitates working with `Files` and `Blobs`. And last but not least [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) is a modern replacement for [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).

```js
var getData = (url) =>
  fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        }),
    );
```

This function will be used later to generate a list of [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Inside the second `then` block a `new Promise` is created. It is necessary because `reader.readAsArrayBuffer` is an asynchronous operation, that triggers `onloadend` or `onerror` after a certain period of time.

## Making Promises

It is time to send out the request for each image.

```js
var promises = Promise.all(imgSrcs.map(getData));
```

[Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) helps in reducing overall delay by sending out the fetch requests simultaneously. Of course it might fail if one image is corrupt.

## Creating Hashes

Final step would be to iterate over the `promises` array, convert each `ArrayBuffer` into `md5` and print out the results.

```js
promises.then((buffers) => buffers.map(md5)).then((hashes) => console.log(hashes));
```

## Final

There are many other things that could be tried. Another hashing algorithm such as `SHA256`. [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) API could be used instead of injecting an external library (Only for SHA). And what about error handling, since `Promise.all` will throw an error if any of the promises fail.

_Code:_

```js
// Get md5 library
var md5 = document.createElement('script');
md5.src = 'https://cdn.jsdelivr.net/npm/js-md5@0.7.3/src/md5.min.js';
document.querySelector('head').appendChild(md5);

// Prepare function to get image blobs
var getData = (url) =>
  fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        }),
    );

// Get image sources
var imgSrcs = [...document.querySelectorAll('img')].map((i) => i.src);

// Load images
var promises = Promise.all(imgSrcs.map(getData));

// Calculate hashes
promises.then((buffers) => buffers.map(md5)).then((hashes) => console.log(hashes));
```

In the end I was satisfied with the results, because modern JavaScript is a powerful tool to know and use.

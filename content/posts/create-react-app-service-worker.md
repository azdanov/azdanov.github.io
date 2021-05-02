---
title: 'Create React App: Service Worker'
date: 2019-02-27T09:26:57.825Z
description: 'How to modify and use a service worker inside create react app.'
tags:
  - React
  - PWA
  - Node
  - Service Worker
image: '/img/react.jpeg'
---

When doing a recent project I decided to add offline capabilities. This was a [dictionary app](https://translations.netlify.com/en/et/)
that relied on internet connectivity, and each new request was expensive time-wise.
Luckily [Create React App](https://facebook.github.io/create-react-app/) comes with an already
configured [Service Worker](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app) that eases turning a React project into a Progressive Web App.

## Enabling the Service Worker

Inside `src/index.js` change `serviceWorker.unregister()` to `serviceWorker.register()`.

This will allow service worker to cache external resources and app files. Which for many use
cases is enough.

Note that by default service workers will update itself only on total page restart, which
means closing all tabs on a device and opening the app again. This can be confusing.

## Updating the Service Worker

Sometimes updating the app is critical to its functionality. On a mobile device a
hidden open tab can prevent a service worker update. Which can lead to a lot of frustration
for both the developer and user.

The easiest way around this is to trigger a force update inside a service worker. This can be
potentially dangerous if the user enters any data inside the app, so keep that in mind.

Currently, there's no way to add a [config option inside webpack](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#generateSW-skipWaiting) to enable this.

Let's do it manually, using `fs` module from node.

After running `npm build` a `build/service-worker.js` will be created:

```js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');

importScripts('/precache-manifest.1627229ec6fca0a0029e621a9027a2fd.js');

workbox.clientsClaim();

self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerNavigationRoute('/index.html', {
  blacklist: [/^\/_/, /\/[^\/]+\.[^\/]+$/],
});
```

To enable force an update `self.skipWaiting()` needs to be added here.

And node is well suited for this job.

1. Create a file `modifyServiceWorker.js`

```js
const fs = require('fs');

fs.readFile('build/service-worker.js', 'utf8', (err, data) => {
  if (err) return console.error(err);

  const snippet = `
self.addEventListener('install', event => {
  self.skipWaiting();
});
  `;

  const result = data.replace('workbox.clientsClaim();', `workbox.clientsClaim();\n${snippet}`);

  fs.writeFile('build/service-worker.js', result, 'utf8', (readError) => {
    if (readError) return console.log(readError);
  });
});
```

2. Modify the npm build script

```json
{
  "scripts": {
    "build": "react-scripts build && node modifyServiceWorker.js"
  }
}
```

This will skip the `waiting` lifecycle of service worker and update it immediately, which
can be good and bad. This depends on the app itself.

## Prompting the user to update

For better user experience would be to ask the user if they are ready for an update.

This is slightly more complicated, but in the end more considerate.

To achieve such behavior we need to display a button, that will send a message to the service
worker on clicking it. Here is a general idea:

1. Adjust `modifyServiceWorker.js` to listen for a `message`

```js
const fs = require('fs');

fs.readFile('build/service-worker.js', 'utf8', (err, data) => {
  if (err) return console.error(err);

  const snippet = `
  addEventListener('message', messageEvent => {
    if (messageEvent.data === 'skipWaiting') return skipWaiting();
  });
  `;

  const result = data.replace('workbox.clientsClaim();', `workbox.clientsClaim();\n${snippet}`);

  fs.writeFile('build/service-worker.js', result, 'utf8', (readError) => {
    if (readError) return console.log(readError);
  });
});
```

2. Modify `serviceWorker.js` and trigger an `onUpdate` hooks for `registration.waiting`

```js
function registerValidSW(swUrl, config) {
  navigator.serviceWorker
  .register(swUrl)
  .then(registration => {
    if (registration.waiting) {
      // Prompt user to update service workers
      if (config && config.onUpdate) {
        config.onUpdate(registration)
      }
    }

    registration.onupdatefound = () => {
      // ...
      installing.onstatechange = () => {
        // ...
      }
    }
  }
}
```

3. Add a `div` inside `public/index.html` for rendering messages

```html
<div id="worker-message"></div>
```

4. Use the `onUpdate` hooks inside `index.js`:

```jsx
serviceWorker.register({
  onUpdate: (registration) => {
    if (registration.waiting) {
      ReactDOM.render(
        <ServiceWorkerMessage registration={registration} />,
        document.querySelector('#worker-message'),
      );
    }
  },
});
```

5. Create `ServiceWorkerMessage` that will work in two steps by sending a message and listening for a change event

```jsx
import React, { useState, useEffect } from 'react';

export const ServiceWorkerMessage = ({ registration }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, []);

  return (
    <React.Fragment>
      {show && (
        <div className="message" role="alert">
          <p className="message__text">
            Your app is ready for an update. Please save any data before proceeding.
          </p>
          <button
            className="message__button"
            onClick={() => {
              setShow(false);
              registration.waiting.postMessage('skipWaiting');
            }}
          >
            Update
          </button>
        </div>
      )}
    </React.Fragment>
  );
};
```

On clicking the `Update` button all open tabs inside the browser will be refreshed.

![Update Message Popup](/img/message.png)

You can view the [GitHub Repo](https://github.com/azdanov/crasw) for a working example.

## Recap

There are many ways to update a service worker. We've seen three:

- Background update, that works when user manually closes all the tabs
- Force with a `skipWaiting` inside the service worker.
- Prompt user for an action that refreshes all the open tabs.

For more information on service worker read the excellent documentation on [developers.google.com](https://developers.google.com/web/tools/workbox/guides/get-started).

---
title: 'Trying out Go'
date: 2019-04-03T14:58:05.062Z
description: 'Exploring Go by building a simple CLI app with some benchmark.'
tags:
  - Go
  - PHP
  - Node
  - Benchmark
image: '/img/go.png'
---

For a while I've been curious about Go and its relevance to Web development.

I've heard a lot of good things about the performance, its rich standard library and how it has become a first language for many PHP and Node developers.

So let's have a go at Go!

## CLI App

You can view the code hosted on GitHub at [azdanov/images](https://github.com/azdanov/images).

Here's the finished version, since this is not a tutorial I will not explain what each part of the code does.

```go
package main

import (
	"bufio"
	"encoding/base64"
	"fmt"
	"log"
	"mime"
	"os"
	"path/filepath"
)

func main() {
	if len(os.Args) == 1 {
		log.Fatal("No arguments specified.")
	}

	image := os.Args[1]

	file, err := os.Open(image)
	if os.IsNotExist(err) {
		log.Fatal("File not found.")
	}

	mimeType := mime.TypeByExtension(filepath.Ext(os.Args[1]))

	supported := []string{
		"image/svg",
		"image/svg+xml",
		"image/gif",
		"image/jpeg",
		"image/png",
	}

	if !inSlice(mimeType, supported) {
		log.Fatal("Image type not supported.")
	}

	info, _ := file.Stat()
	buf := make([]byte, info.Size())

	fReader := bufio.NewReader(file)
	_, _ = fReader.Read(buf)

	data := fmt.Sprintf(
		"data:%s;base64,%s",
		mimeType,
		base64.StdEncoding.EncodeToString(buf)
	)

	fmt.Print(data)
}

func inSlice(a string, list []string) bool {
	for _, b := range list {
		if a == b {
			return true
		}
	}
	return false
}
```

Original was made in PHP:

```php
<?php

declare(strict_types=1);

array_shift($argv);
$image = array_shift($argv);

if (!$image) {
    fwrite(STDERR, 'No arguments specified.');
    die(1);
}
if (!file_exists($image)) {
    fwrite(STDERR, 'File not found.');
    die(1);
}

$mime = mime_content_type($image);

$supported = ['image/svg', 'image/svg+xml', 'image/gif', 'image/jpeg', 'image/png'];
if (!in_array($mime, $supported)) {
    fwrite(STDERR, 'Image type not supported.');
    die(1);
}

if ($mime === 'image/svg') {
    $mime .= '+xml';
}

$data = file_get_contents($image);

die("data:${mime};base64," . base64_encode($data));
```

And for fun here's Node:

```javascript
const { existsSync, readFileSync } = require('fs');
const { extname } = require('path');

if (process.argv.length == 2) {
  process.stderr.write('No arguments specified.');
  process.exit(1);
}

const image = process.argv[2];

if (!existsSync(image)) {
  process.stderr.write('File not found.');
  process.exit(1);
}

const extension = extname(image).substr(1);
const supported = ['image/svg+xml', 'image/gif', 'image/jpeg', 'image/png'];
const mime = supported.find((s) => s.includes(extension));

if (!mime) {
  process.stderr.write('Image type not supported.');
  process.exit(1);
}

const data = readFileSync(image);
process.stdout.write(`data:${mime};base64,${data.toString('Base64')}`);
```

## Benchmark

I was curious how much Go would outperform PHP and Node, and was pleasantly surprised.

[hyperfine](https://github.com/sharkdp/hyperfine) was used for the benchmarks.

|                                                                                                                              PHP (PHP 7.3.3)                                                                                                                               |                                                                                                                         Go (go1.12.1 darwin/amd64)                                                                                                                         |                                                                                                                              Node (v11.13.0)                                                                                                                               |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|                                                                                                                  User: 20.6ms, System: 9.8ms <br> 74 runs                                                                                                                  |                                                                                                                  User: 5.1ms, System: 2.2ms <br> 286 runs                                                                                                                  |                                                                                                                 User: 72.9ms, System: 18.7ms <br> 30 runs                                                                                                                  |
| [<img width="250" alt="Screenshot 2019-04-03 at 02 24 04" src="https://user-images.githubusercontent.com/6123841/55442537-becd1c00-55b7-11e9-8d53-5ab7d3f207ad.png">](https://user-images.githubusercontent.com/6123841/55442537-becd1c00-55b7-11e9-8d53-5ab7d3f207ad.png) | [<img width="250" alt="Screenshot 2019-04-03 at 02 25 08" src="https://user-images.githubusercontent.com/6123841/55442538-becd1c00-55b7-11e9-96c8-3591b8695f36.png">](https://user-images.githubusercontent.com/6123841/55442538-becd1c00-55b7-11e9-96c8-3591b8695f36.png) | [<img width="250" alt="Screenshot 2019-04-03 at 03 57 33" src="https://user-images.githubusercontent.com/6123841/55445574-b16a5e80-55c4-11e9-84af-aa0c6bfca89c.png">](https://user-images.githubusercontent.com/6123841/55445574-b16a5e80-55c4-11e9-84af-aa0c6bfca89c.png) |

## Finish

I didn't expect Node to be that slow compared to PHP. I guess PHP is performant enough for most Web related tasks.

So in conclusion Go is really an interesting language, there is a good reason it's called the `C` language of the web.

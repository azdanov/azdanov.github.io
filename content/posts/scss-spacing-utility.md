---
title: 'SCSS: A spacing utility'
date: 2019-03-18T22:18:23.838Z
description: 'Spacing utility inspired by Tailwind CSS.'
tags:
  - SCSS
  - Snippet
  - Trivia
image: '/img/sass.png'
---

In [Tailwind CSS](https://tailwindcss.com/) there is an amazing utility for adding [padding and margin](https://tailwindcss.com/docs/spacing/#app) which makes spatial positioning of element a joy.

While working with [Bulma](https://bulma.io/) I've started to miss previously provided handy functionality.

This snippet should remedy this:

```scss
$sizeUnit: rem;
$marginKey: 'm';
$paddingKey: 'p';
$separator: '-';
$sizes: (('0', 0), ('1', 0.125), ('2', 0.25), ('3', 0.5), ('4', 1), ('5', 2), ('6', 4), ('7', 5.5));
$positions: (('t', 'top'), ('r', 'right'), ('b', 'bottom'), ('l', 'left'));

@function sizeUnitValue($key, $value) {
  @return if($key == 'none', 0, $value + $sizeUnit);
}

@each $size in $sizes {
  $sizeKey: nth($size, 1);
  $sizeValue: nth($size, 2);
  .#{$marginKey}#{$separator}#{$sizeKey} {
    margin: sizeUnitValue($sizeKey, $sizeValue);
  }
  .#{$paddingKey}#{$separator}#{$sizeKey} {
    padding: sizeUnitValue($sizeKey, $sizeValue);
  }
  @each $position in $positions {
    $posKey: nth($position, 1);
    $posValue: nth($position, 2);
    .#{$marginKey}#{$posKey}#{$separator}#{$sizeKey} {
      margin-#{$posValue}: sizeUnitValue($sizeKey, $sizeValue);
    }
    .#{$paddingKey}#{$posKey}#{$separator}#{$sizeKey} {
      padding-#{$posValue}: sizeUnitValue($sizeKey, $sizeValue);
    }
  }
}
```

This will generate:

```css
/* ... */
.m-1 {
  margin: 0.125rem;
}
.p-1 {
  padding: 0.125rem;
}
.mt-1 {
  margin-top: 0.125rem;
}
.pt-1 {
  padding-top: 0.125rem;
}
.mr-1 {
  margin-right: 0.125rem;
}
.pr-1 {
  padding-right: 0.125rem;
}
.mb-1 {
  margin-bottom: 0.125rem;
}
.pb-1 {
  padding-bottom: 0.125rem;
}
.ml-1 {
  margin-left: 0.125rem;
}
.pl-1 {
  padding-left: 0.125rem;
}
/* ... */
```

Quite useful.

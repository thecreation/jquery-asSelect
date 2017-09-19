# [jQuery asSelect](https://github.com/amazingSurge/jquery-asSelect) ![bower][bower-image] [![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] [![prs-welcome]](#contributing)

> A jquery plugin that make a select more functional.

## Table of contents
- [Main files](#main-files)
- [Quick start](#quick-start)
- [Requirements](#requirements)
- [Usage](#usage)
- [Examples](#examples)
- [Options](#options)
- [Methods](#methods)
- [Events](#events)
- [No conflict](#no-conflict)
- [Browser support](#browser-support)
- [Contributing](#contributing)
- [Development](#development)
- [Changelog](#changelog)
- [Copyright and license](#copyright-and-license)

## Main files
```
dist/
├── jquery-asSelect.js
├── jquery-asSelect.es.js
├── jquery-asSelect.min.js
└── css/
    ├── asSelect.css
    └── asSelect.min.css
```

## Quick start
Several quick start options are available:
#### Download the latest build

 * [Development](https://raw.githubusercontent.com/amazingSurge/jquery-asSelect/master/dist/jquery-asSelect.js) - unminified
 * [Production](https://raw.githubusercontent.com/amazingSurge/jquery-asSelect/master/dist/jquery-asSelect.min.js) - minified

#### Install From Bower
```sh
bower install jquery-asSelect --save
```

#### Install From Npm
```sh
npm install jquery-asSelect --save
```

#### Install From Yarn
```sh
yarn add jquery-asSelect
```

#### Build From Source
If you want build from source:

```sh
git clone git@github.com:amazingSurge/jquery-asSelect.git
cd jquery-asSelect
npm install
npm install -g gulp-cli babel-cli
gulp build
```

Done!

## Requirements
`jquery-asSelect` requires the latest version of [`jQuery`](https://jquery.com/download/).

## Usage
#### Including files:

```html
<link rel="stylesheet" href="/path/to/asSelect.css">
<script src="/path/to/jquery.js"></script>
<script src="/path/to/jquery-asSelect.js"></script>
```

#### Required HTML structure

```html
<select class="example">
  <option value="a">beijing</option>
  <option value="b">fujian</option>
  <option value="c">zhejiang</option>
  <option value="d">tianjin</option>
  <option value="e">shanghai</option>
</select>
```

#### Initialization
All you need to do is call the plugin on the element:

```javascript
jQuery(function($) {
  $('.example').asSelect(); 
});
```

## Examples
There are some example usages that you can look at to get started. They can be found in the
[examples folder](https://github.com/amazingSurge/jquery-asSelect/tree/master/examples).

## Options
`jquery-asSelect` can accept an options object to alter the way it behaves. You can see the default options by call `$.asSelect.setDefaults()`. The structure of an options object is as follows:

```
{
  namespace: 'asSelect',
  skin: null,
  trigger: 'click', // 'hover' or 'click'
  offset: [0, 0], // set panel offset to trigger element
  json: null, // if is a object,it will build from the object
  preload: false, // preload some data set in load option
  load: null, // preload data set here
  maxHeight: 350, // set panel maxHeight, lists' height is bigger than maxHeight, scroll bar will show
  select: undefined, // set initial selest value

  render: {
    label(selected) {
      if (selected) {
        return selected.text;
      }
      return 'Choose one';
    },
    option(item) {
      return item.text;
    },
    group(item) {
      return item.label;
    }
  },

  onChange: function() {}
}
```

## Methods
Methods are called on asSelect instances through the asSelect method itself.
You can also save the instances to variable for further use.

```javascript
// call directly
$().asSelect('destroy');

// or
var api = $().data('asSelect');
api.destroy();
```

#### show()
Show the select dropdown
```javascript
$().asSelect('show');
```

#### hide()
Hide the select dropdown
```javascript
$().asSelect('hide');
```

#### val(value)
Set the select value if value is defined or get the value.
```javascript
// set the val
$().asSelect('val', '5');

// get the val
var value = $().asSelect('val');
```

#### set(value)
Set the select value
```javascript
$().asSelect('set', '5');
```

#### get()
Get the select value.
```javascript
var value = $().asSelect('get');
```

#### enable()
Enable the select functions.
```javascript
$().asSelect('enable');
```

#### disable()
Disable the select functions.
```javascript
$().asSelect('disable');
```

#### destroy()
Destroy the select instance.
```javascript
$().asSelect('destroy');
```

## Events
`jquery-asSelect` provides custom events for the plugin’s unique actions. 

```javascript
$('.the-element').on('asSelect::ready', function (e) {
  // on instance ready
});

```

Event   | Description
------- | -----------
init    | Fires when the instance is setup for the first time.
ready   | Fires when the instance is ready for API use.
change  | Fires when the value is changing
enable  | Fired immediately when the `enable` instance method has been called.
disable | Fired immediately when the `disable` instance method has been called.
destroy | Fires when an instance is destroyed. 

## No conflict
If you have to use other plugin with the same namespace, just call the `$.asSelect.noConflict` method to revert to it.

```html
<script src="other-plugin.js"></script>
<script src="jquery-asSelect.js"></script>
<script>
  $.asSelect.noConflict();
  // Code that uses other plugin's "$().asSelect" can follow here.
</script>
```

## Browser support

Tested on all major browsers.

| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/safari/safari_32x32.png" alt="Safari"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/chrome/chrome_32x32.png" alt="Chrome"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/firefox/firefox_32x32.png" alt="Firefox"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/edge/edge_32x32.png" alt="Edge"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/internet-explorer/internet-explorer_32x32.png" alt="IE"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/opera/opera_32x32.png" alt="Opera"> |
|:--:|:--:|:--:|:--:|:--:|:--:|
| Latest ✓ | Latest ✓ | Latest ✓ | Latest ✓ | 9-11 ✓ | Latest ✓ |

As a jQuery plugin, you also need to see the [jQuery Browser Support](http://jquery.com/browser-support/).

## Contributing
Anyone and everyone is welcome to contribute. Please take a moment to
review the [guidelines for contributing](CONTRIBUTING.md). Make sure you're using the latest version of `jquery-asSelect` before submitting an issue. There are several ways to help out:

* [Bug reports](CONTRIBUTING.md#bug-reports)
* [Feature requests](CONTRIBUTING.md#feature-requests)
* [Pull requests](CONTRIBUTING.md#pull-requests)
* Write test cases for open bug issues
* Contribute to the documentation

## Development
`jquery-asSelect` is built modularly and uses Gulp as a build system to build its distributable files. To install the necessary dependencies for the build system, please run:

```sh
npm install -g gulp
npm install -g babel-cli
npm install
```

Then you can generate new distributable files from the sources, using:
```
gulp build
```

More gulp tasks can be found [here](CONTRIBUTING.md#available-tasks).

## Changelog
To see the list of recent changes, see [Releases section](https://github.com/amazingSurge/jquery-asSelect/releases).

## Copyright and license
Copyright (C) 2016 amazingSurge.

Licensed under [the LGPL license](LICENSE).

[⬆ back to top](#table-of-contents)

[bower-image]: https://img.shields.io/bower/v/jquery-asSelect.svg?style=flat
[bower-link]: https://david-dm.org/amazingSurge/jquery-asSelect/dev-status.svg
[npm-image]: https://badge.fury.io/js/jquery-asSelect.svg?style=flat
[npm-url]: https://npmjs.org/package/jquery-asSelect
[license]: https://img.shields.io/npm/l/jquery-asSelect.svg?style=flat
[prs-welcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
[daviddm-image]: https://david-dm.org/amazingSurge/jquery-asSelect.svg?style=flat
[daviddm-url]: https://david-dm.org/amazingSurge/jquery-asSelect
# oggy [![Build Status](https://travis-ci.org/stephanecodes/oggy.svg?branch=master)](https://travis-ci.org/stephanecodes/oggy)

>


## Install

```
$ npm install oggy
```


## Usage

```js
const oggy = require('oggy');

(async () => {

	const scraper = oggy();
	const response = await scraper.scrap('http://ogp.me/');

	/*

	response.graph = {

	}

	*/

})();

await oggy();
//=> 'unicorns & rainbows'
```


## API

### oggy(input, [options])

#### input

Type: `string`

Lorem ipsum.

#### options

Type: `Object`

##### foo

Type: `boolean`<br>
Default: `false`

Lorem ipsum.


## License

MIT © [Stephane Janicaud](https://github.com/stephanecodes)

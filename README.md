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
	const res = await scraper.scrape('http://ogp.me/');
	
	// =>

	response.metadata = {
		...
	}

})();
```


## API

### oggy.scrape(url, [options])

#### url

Type: `string`

Lorem ipsum.

#### options

Type: `Object`

##### userContext

Type: `Object`<br>
Default: `{}`

Lorem ipsum.


## License

MIT © [Stephane Janicaud](https://github.com/stephanecodes)

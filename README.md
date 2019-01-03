<p align="center">
	<img src="media/logo.gif" width="300">
	<br>
	<br>
</p>

# oggy
[![Build Status](https://travis-ci.org/stephanecodes/oggy.svg?branch=master)](https://travis-ci.org/stephanecodes/oggy) [![Coverage Status](https://coveralls.io/repos/github/stephanecodes/oggy/badge.svg?branch=master)](https://coveralls.io/github/stephanecodes/oggy?branch=master)

>Scrape and fusion Open Graph, Twitter and other DOM metadata easily


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

	// => res.oggyfied = {}

})();
```


## API

### oggy([options])

#### options

Type: `Object`

### scraper.scrape(url, [options])

#### url

Type: `string`

The url to scrape.

#### options

Type: `Object`

##### user

Type: `Object`<br>
Default: `{}`

Optional object with user profile.
Useful for some hooks. For example, adding some user information to request headers.


## Hooks

```js
module.exports = () => {
	const name = 'oggy-hook';

	const handleUrl = url => {
		// Check if hook handles this url
		return /stephanecodes/.test(url.hostname);
	};

	const beforeScrapeUrl = (headers, context) => {
		// Add or override request headers
	};

	const afterScrapeUrl = (oggyfied, content, context) => {
		// Override oggyfied metada or do something with it
		// You also have access to initial url, content body and all parsed metadata
	};

	return {name, handleUrl, beforeScrapeUrl, afterScrapeUrl};
};


```



## License

MIT © [Stephane Janicaud](https://github.com/stephanecodes)

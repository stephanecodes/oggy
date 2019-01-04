<p align="center">
	<img src="media/logo.gif">
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
	const res = await scraper.scrape('https://octoverse.github.com/');

	// => res = {initialUrl: "...", oggyfied: {...}, og: {...}, twitter: {...}}
	// => res = {initialUrl: "...", error: {...}} if an error occurs

})();
```


## API

### oggy([options])

#### options

Type: `Object`

### oggy.scrape(url, [options])

#### url

Type: `string`

The url to scrape.

#### options

Type: `Object`

##### context

Type: `Object`<br>
Default: `{}`

An optional context available inside `hook.beforeRequest` and `hook.beforeResponse`.

Be careful not to put sensitive data in this context unless you know what you're doing.


## Hooks

Hooks allow to modify request headers and change returned metadata.

```js
module.exports = (options) => {
	const name = 'captain-hook';

	const handleUrl = url => {
		// Check if hook handles this url
		return /stephanecodes/.test(url.hostname);
	};

	const beforeRequest = (headers, context) => {
		// Add or override request headers
	};

	const beforeResponse = (result, content, context) => {
		// Override result or do something with it
		// You also have access to initial url, content body, all parsed metadata.
	};

	return {name, handleUrl, beforeRequest, beforeResponse};
};
```

### Use cases

#### Forward a token

This hook will add a header with current user login to every request.

```js
module.exports = () => {

	const name = 'add-user-token';

	const handleUrl = url => true;

	const beforeRequest = (headers, context) => {
		if(context.userToken) {
			headers['x-user-token'] = context.userToken;
		}
	};

	return {name, handleUrl, beforeRequest};
};
```
In this case, the user's token is available in the context only if the url is on the same domain.

```js
const oggy = require('oggy');
const hook = require './hooks/user-token';

(async () => {

	const scraper = oggy({hooks: [hook()]);

	let urls = [/*...*/]

	urls.forEach(url => {
		let options = {};
		// Ensure url is on same domain
		if(isSameDomainUrl(url)) {
			options.context = {userToken: getUserToken()};
		}
		const res = await scraper.scrape(url, options);
	});


})();


```




## License

MIT © [Stephane Janicaud](https://github.com/stephanecodes)

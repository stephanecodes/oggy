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

Returns Open Graph, Twitter and Oggyfied metadata.

- **oggyfied** - Type: `Object` - Unified metadata
- **og** - Type: `Object` - Open Graph metadata
- **twitter** - Type: `Object` - Twitter metadata
- **initialUrl** - Type: `String` - The initial url
- **time** - Type: `Long` - Scrape duration in milliseconds
- **error** - Type: `Object` - If an error occurs (metadata won't be available)



```json
{
  "oggyfied": {
    "title": "The State of the Octoverse",
    "description": "The State of the Octoverse reflects on 2018 so far, teamwork across time zones, and 1.1 billion contributions.",
    "siteName": "The State of the Octoverse",
    "image": "https://octoverse.github.com/assets/images/social-card.png",
    "url": "https://octoverse.github.com/",
    "locale": "en_US"
  },
  "og": {
    "title": "The State of the Octoverse",
    "locale": "en_US",
    "description": "The State of the Octoverse reflects on 2018 so far, teamwork across time zones, and 1.1 billion contributions.",
    "url": "https://octoverse.github.com/",
    "site_name": "The State of the Octoverse",
    "image": "https://octoverse.github.com/assets/images/social-card.png"
  },
  "twitter": {
    "card": "summary_large_image",
    "site": "@github"
  },
  "initialUrl": "https://octoverse.github.com/",
  "time": 245
}
```


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
const hook = userTokenHook();
const scraper = oggy({hooks: [hook]);

let urls = [/*...*/]

urls.forEach(url => {
	let options = {};
	// Ensure url is on same domain
	if(isSameDomainUrl(url)) {
		options.context = {userToken: getUserToken()};
	}
	const res = await scraper.scrape(url, options);
});

```




## License

MIT

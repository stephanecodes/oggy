'use strict';

const URL = require('url');
const _ = require('lodash');
const got = require('got');
const entities = require('entities');

module.exports = (options = {}) => {
	const defaults =
	{
		options: {
			allowNonHTMLContentType: false,
			// Limit content length to 1MB by default
			maxContentLength: 1048576,
			useGoogleFavicon: false,
			acceptShortcutIcon: false,
			requestTimeout: 5000,
			requiredProps: [],
			exclusions: [],
			metadata: false,
			hooks: []
		}
	};

	const oggyOptions = got.mergeOptions(defaults.options, options);
	// Concat default hooks with provided ones
	oggyOptions.hooks = [].concat(options.hooks || []);

	const oggyGot = got.create({
		options: got.mergeOptions(got.defaults.options, {
			maxContentLength: oggyOptions.maxContentLength,
			// Set default headers
			headers: {
				// Some websites will return empty response data if request is not made by a browser
				// We use a common browser User-Agent to prevent this (Chrome Generic on Win10)
				// "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
				'user-agent': 'Mozilla/5.0 (compatible ; Googlebot/2.1 ; +http://www.google.com/bot.html)'
				// 'user-agent': 'Mozilla/5.0 (compatible; Twitterbot/1.0)'
			}
		}),
		handler: (options, next) => {
			const promise = next(options);
			if (typeof options.maxContentLength === 'number') {
				promise.on('downloadProgress', progress => {
					if (progress.transferred > options.maxContentLength && progress.percent !== 1) {
						promise.cancel(`Content length cannot exceed ${options.maxContentLength} bytes (gzipped or not)`);
					}
				});
			}
			return promise;
		}
	});

	const assertUrlIsNotMalformed = url => {
		if (!/^https?:\/\//i.test(url)) {
			throw new Error('The requested url does not have a valid protocol (http/https)');
		}
	};

	const assertUrlIsAllowed = url => {
		if (Array.isArray(oggyOptions.exclusions)) {
			const match = oggyOptions.exclusions.some(exclusion => {
				const re = new RegExp(exclusion, 'g');
				return re.test(url);
			});
			if (match) {
				throw new Error(`Url '${url}' matches an exclusion and thus won't be scraped`);
			}
		}
	};

	const assertContentTypeIsAllowed = contentType => {
		if (!oggyOptions.allowNonHTMLContentType) {
			if (!/^text\/html/i.test(contentType)) {
				throw new Error(`Invalid content-type. Expected 'text/html' but received '${contentType}'`);
			}
		}
	};

	const assertComplete = props => {
		const {requiredProps} = oggyOptions;
		if (requiredProps) {
			const prop = requiredProps.find(prop => !props[prop]);
			if (prop) {
				throw new Error(`Missing property '${prop}'`);
			}
		}
	};

	const cleanup = props => {
		for (const prop in props) {
			// Remove every property with an empty value
			if (props[prop] === undefined) {
				delete props[prop];
			} else {
				// Convert HTML entities on some properties
				if (/title|description|siteName/.test(prop)) {
					props[prop] = entities.decodeHTML(props[prop]);
				}
				// Remove carriage returns, line feeds and trailing spaces
				props[prop] = props[prop].replace(/\r+|\n+/g, '. ').trim();
			}
		}
		return props;
	};

	// Clean host name by removing `www`
	const cleanHostname = hostname => hostname && hostname.replace(/^www\./, '');

	const getBaseUrl = urlObject => {
		return urlObject.href.substring(0, urlObject.href.length - urlObject.path.length);
	};

	// Returns the content of a tag
	// getTagContent(`<ns:tag>Awesome</ns:tag>`) returns `Awesome`
	// getTagContent(`<tag>This is great !</tag>`) returns `This is great !`
	const getTagContent = tag => {
		return tag && tag.replace(/<.*?>/gi, '');
	};

	// Returns a tag attribute value
	// getTagAttributeValue(`<ns:tag foo="bar">`, `foo`) returns `bar`
	// getTagAttributeValue(`<meta name="title">`, `name`) returns `title`
	const getTagAttributeValue = (tag, attribute) => {
		let m;

		// Check if attribute exists
		// It must be preceded by a whitespace to prevent `ng-href` to be matched instead of `href`
		let re = new RegExp('\\s' + attribute + '=(["\'`])', 'i');
		if ((m = re.exec(tag))) {
			// Group 1 contains attribute value delimiter
			// now we know the delimiter, we can build
			// the regex to extract attribute value
			// which should contain at least one character
			// https://regex101.com/r/ujVMQM/2
			re = new RegExp(
				'\\s' + attribute + '=' + m[1] + '(.+?)' + m[1] + '[\\s\\/>]'
			);
			if ((m = re.exec(tag))) {
				// Group 1 contains attribute value,
				// we can safely return it
				return m[1];
			}
		}
	};

	const tagToMeta = tag => {
		let nameOrProperty;
		let value;

		nameOrProperty = getTagAttributeValue(tag, 'name');
		if (!nameOrProperty) {
			nameOrProperty = getTagAttributeValue(tag, 'property');
		}
		if (nameOrProperty) {
			nameOrProperty = nameOrProperty.toLowerCase();
			value = getTagAttributeValue(tag, 'content');
			if (value) {
				return {
					nameOrProperty,
					value
				};
			}
		}
	};

	function fusion(data, urlObject) {
		const title = _.get(data, 'og.title') ||
			_.get(data, 'twitter.title') ||
			_.get(data, 'otherMeta.title') ||
			_.get(data, 'misc.title');

		const description = _.get(data, 'og.description') ||
			_.get(data, 'twitter.description') ||
			_.get(data, 'otherMeta.description');

		const siteName = _.get(data, 'og.site_name') ||
			_.get(data, 'twitter.domain') ||
			cleanHostname(urlObject.hostname);

		const image = _.get(data, 'og.image') ||
			_.get(data, 'twitter.image');

		const url = _.get(data, 'og.url') ||
			_.get(data, 'twitter.url');

		const type = _.get(data, 'og.type');

		const icon = _.get(data, 'misc.icon');

		const locale = _.get(data, 'og.locale') ||
			_.get(data, 'misc.locale');

		return {title, description, siteName, image, url, type, icon, locale};
	}

	const findIconUrl = (body, urlObject) => {
		// Using Google's S2 in the fastest way to retrieve a 16x16 favicon
		// It's still working after 7 years
		if (oggyOptions.useGoogleFavicon) {
			return 'https://www.google.com/s2/favicons?domain=' + urlObject.hostname;
		}

		let iconUrl;

		const re = /<link[^>]*?rel=[^>]*?icon["'`].*?\.(png|jpg|jpeg|gif)[^>]*?>/gi;

		// Order icons by size (small to large)
		const tags = (body.match(re) || []).sort((a, b) => {
			let m2;

			const re2 = /(?=)sizes\s*=\s*\W(\d+)/i;
			m2 = a.match(re2);
			const sizeA = m2 ? parseInt(m2[1], 10) : 1;
			m2 = b.match(re2);
			const sizeB = m2 ? parseInt(m2[1], 10) : 1;

			if (sizeA < sizeB) {
				return -1;
			}
			if (sizeA > sizeB) {
				return 1;
			}
			return 0;
		});

		// If no tag was found, fallback to shortcut icon if accepted
		if (tags.length === 0) {
			if (oggyOptions.acceptShortcutIcon) {
				let m;

				if ((m = body.match(/<link.*?shortcut\s+icon.*?>/))) {
					tags.push(m[0]);
				}
			}
		}

		// Use href of the first tag if any
		// Otherwise use Google favicon service
		if (tags.length > 0) {
			iconUrl = getTagAttributeValue(tags[0], 'href');
			if (/:\/\//.test(iconUrl) === false) {
				iconUrl = URL.resolve(getBaseUrl(urlObject), iconUrl);
			}
		}

		return iconUrl;
	};

	function parse(body, urlObject) {
		const metadata = {
			og: {},
			twitter: {},
			otherMeta: {},
			misc: {}
		};

		// Grab <meta> values
		(body.match(/<meta.*?>/gi) || []).forEach(tag => {
			const meta = tagToMeta(tag);
			if (meta && meta.nameOrProperty) {
				if (meta.nameOrProperty.startsWith('og:')) {
					metadata.og[meta.nameOrProperty.substring(3)] = meta.value;
				} else if (meta.nameOrProperty.startsWith('twitter:')) {
					metadata.twitter[meta.nameOrProperty.substring(8)] = meta.value;
				} else {
					metadata.otherMeta[meta.nameOrProperty] = meta.value;
				}
			}
		});

		// Find page title
		(body.match(/<title>(.*)<\/title>/i) || []).forEach(tag => {
			metadata.misc.title = getTagContent(tag);
		});

		// Find page locale
		(body.match(/<html.*?>/i) || []).forEach(tag => {
			metadata.misc.locale = getTagAttributeValue(tag, 'lang');
		});

		// Find icon
		metadata.misc.icon = findIconUrl(body, urlObject);

		return metadata;
	}

	// Returns only hooks which handle passed url
	const hooksForUrl = urlObject => {
		return oggyOptions.hooks.filter(hook => hook.handleUrl(urlObject));
	};

	// Scrape one url
	const scrape = async (url, context) => {
		try {
			let time = Date.now(); // Start timer

			assertUrlIsNotMalformed(url);
			assertUrlIsAllowed(url);

			const urlObject = URL.parse(url, false, true);
			const oggyHooks = hooksForUrl(urlObject);

			context = context || {};

			const res = await oggyGot(urlObject, {
				timeout: oggyOptions.requestTimeout,
				headers: oggyOptions.headers || {},
				hooks: {
					beforeRequest: [
						options => {
							// Call internal hooks for this url
							oggyHooks.forEach(hook => {
								if (hook.beforeScrapeUrl) {
									hook.beforeScrapeUrl(options.headers, context);
								}
							});
						}
					]
				}
			});

			assertContentTypeIsAllowed(res.headers['content-type']);

			const body = res.body || '';
			const metadata = parse(body, urlObject);
			let oggyfied = fusion(metadata, urlObject);

			oggyHooks.forEach(hook => {
				if (hook.afterScrapeUrl) {
					const content = {url: urlObject, body, metadata, headers: res.headers};
					hook.afterScrapeUrl(oggyfied, content, context);
				}
			});

			oggyfied = cleanup(oggyfied);

			assertComplete(oggyfied);

			time = Date.now() - time; // Stop timer

			if (oggyOptions.metadata === true) {
				return {initialUrl: url, oggyfied, metadata, time};
			}
			return {initialUrl: url, oggyfied, time};
		} catch (err) {
			return {initialUrl: url, error: {message: err.message}};
		}
	};

	// Scrape multiple urls
	const scrapeAll = async (urls, options) => {
		const promises = urls.map(url => scrape(url, options));
		return Promise.all(promises);
	};

	return {defaults, scrape, scrapeAll};
};

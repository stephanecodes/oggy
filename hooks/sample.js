module.exports = () => {
	const name = 'oggy-hook';

	const handleUrl = url => /stephanecodes/.test(url.hostname);

	const beforeScrapeUrl = (requestHeaders, context) => {
		if (context.userContext.uid) {
			requestHeaders['x-user-uid'] = context.userContext.uid;
		}
		if (context.clientBrowserRequest) {
			// Forward `Authorization header`
			requestHeaders.Authorization = context.clientBrowserRequest.headers.Authorization;
		}
	};

	const afterScrapeUrl = (metadata, context) => {
		if (context.userContext.fullName) {
			metadata.title = `/// Hooked for ${context.userContext.fullName} /// ${metadata.title}`;
		} else {
			metadata.title = '/// Hooked ///';
		}
	};

	return {name, handleUrl, beforeScrapeUrl, afterScrapeUrl};
};

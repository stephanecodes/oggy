module.exports = () => {
	const name = 'oggy-hook';

	const handleUrl = url => /stephanecodes/.test(url.hostname);

	const beforeScrapeUrl = (headers, context) => {
		if (context.user && context.user.uid) {
			headers['x-user-uid'] = context.user.uid;
		}
	};

	const afterScrapeUrl = (oggyfied, content, context) => {
		if (context.user && context.user.fullName) {
			oggyfied.title = `/// Hooked for ${context.user.fullName} /// ${oggyfied.title}`;
		} else {
			oggyfied.title = '/// Hooked ///';
		}
	};

	return {name, handleUrl, beforeScrapeUrl, afterScrapeUrl};
};

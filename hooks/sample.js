module.exports = () => {
	const name = 'oggy-hook';

	const handleUrl = url => /stephanecodes/.test(url.hostname);

	const beforeRequest = (headers, context) => {
		if (context.user && context.user.uid) {
			headers['x-user-uid'] = context.user.uid;
		}
	};

	const beforeResponse = (res, content, context) => {
		if (context.user && context.user.fullName) {
			res.oggyfied.title = `/// Hooked for ${context.user.fullName} /// ${res.oggyfied.title}`;
		} else {
			res.oggyfied.title = '/// Hooked ///';
		}
	};

	return {name, handleUrl, beforeRequest, beforeResponse};
};

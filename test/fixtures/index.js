const fs = require('fs');
const path = require('path');
const url = require('url');
const nock = require('nock');

const defaults = {
	url: 'https://stephanecodes.github.io'
}

const list = type => {
	let dirpath = path.join(__dirname, type);
	return fs
		.readdirSync(dirpath)
		.filter(filename => /\.json$/.test(filename))
		.map(filename => filename.substring(0, filename.length - 5));
	;
}

const get = key => {
	let keyParts = key.split('.');
	let type = keyParts[0];
	let name = keyParts[1];

	let jsonFile = path.join(__dirname, type, `${name}.json`);
	let bodyFile = path.join(__dirname, type, `${name}.html`);
	let contentType = 'text/html';

	let fixture = require(jsonFile);

	const urlObject = url.parse(fixture.initialUrl || defaults.url);
	const nockUrl = `${urlObject.protocol}//${urlObject.host}`;

	return {key, url: nockUrl, contentType, bodyFile, ...fixture};
}

const use = arg => {
	let fixture = (typeof arg === 'string')
		? get(arg)
		: arg;

	nock(fixture.url)
		.get('/')
		.replyWithFile(200, fixture.bodyFile, {
			'Content-Type': fixture.contentType,
		});

	return fixture;
}

module.exports = {defaults, get, use, list};


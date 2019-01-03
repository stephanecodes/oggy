import path from 'path';
import test from 'ava';
import oggy from '..';
import fixtures from './fixtures';

test('invalid content-type', async t => {
	const scraper = oggy();
	const fixture = fixtures.use({
		url: fixtures.defaults.url,
		contentType: 'application/json',
		bodyFile: path.resolve('test/fixtures/boilerplate/basic.json')
	});
	const res = await scraper.scrape(fixture.url);

	t.truthy(res.error);
	t.true(/invalid content-type/i.test(res.error.message));
});

test('exclusion', async t => {
	const scraper = oggy({exclusions: ['dont\\.scrape\\.me']});
	const res = await scraper.scrape('https://dont.scrape.me');

	t.truthy(res.error);
	t.true(/matches an exclusion/i.test(res.error.message));
});

test('malformed url', async t => {
	const scraper = oggy();
	const res = await scraper.scrape('htttps://malformed.url');

	t.truthy(res.error);
	t.true(/the requested url does not have a valid protocol/i.test(res.error.message));
});

test('missing property', async t => {
	const scraper = oggy({requiredProps: ['dummy']});
	const fixture = fixtures.use('boilerplate.basic');
	const res = await scraper.scrape(fixture.url);

	t.truthy(res.error);
	t.true(/missing property/i.test(res.error.message));
});

test('max content length', async t => {
	const scraper = oggy({maxContentLength: 100});
	const fixture = fixtures.use('boilerplate.basic');
	const res = await scraper.scrape(fixture.url);

	t.truthy(res.error);
	t.true(/content length cannot exceed 100 bytes/i.test(res.error.message));
});


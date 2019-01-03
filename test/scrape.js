import test from 'ava';
import oggy from '..';
import fixtures from './fixtures';

test('required properties', async t => {
	const scraper = oggy({requiredProps: ['title', 'locale']});
	const fixture = fixtures.use('boilerplate.basic');
	const res = await scraper.scrape(fixture.url);

	t.truthy(res.oggyfied);
	t.is(res.oggyfied.title, 'Basic boilerplate');
	t.is(res.oggyfied.locale, 'en');
});

test('use hostname as sitename when sitename is undefined', async t => {
	const scraper = oggy();
	const fixture = fixtures.use('boilerplate.basic');
	const res = await scraper.scrape(fixture.url);

	t.truthy(res.oggyfied);
	t.is(res.oggyfied.siteName, 'stephanecodes.github.io');
});

test('accept shortcut icon', async t => {
	const scraper = oggy({acceptShortcutIcon: true});
	const fixture = fixtures.use('boilerplate.basic');
	const res = await scraper.scrape(fixture.url);

	t.truthy(res.oggyfied);
	t.is(res.oggyfied.icon, fixture.url.concat('/favicon.ico'));
});

test('use Google favicon', async t => {
	const scraper = oggy({useGoogleFavicon: true});
	const fixture = fixtures.use('website.tiktok');
	const res = await scraper.scrape(fixture.url);

	t.truthy(res.oggyfied);
	t.is(res.oggyfied.icon, 'https://www.google.com/s2/favicons?domain=www.tiktok.com');
});

test('scrape multiple', async t => {
	const scraper = oggy({exclusions: ['tiktok\\.com']});

	const fixture1 = fixtures.use('website.youtube');
	const fixture2 = fixtures.use('website.tiktok');
	const fixture3 = fixtures.use('website.instagram');

	const res = await scraper.scrapeAll([
		fixture1.url,
		fixture2.url,
		fixture3.url
	]);

	t.true(res.length === 3);
	t.truthy(res[0].oggyfied);
	t.truthy(res[1].error); // Must return an error as url matches one exclusion
	t.truthy(res[0].oggyfied);
});


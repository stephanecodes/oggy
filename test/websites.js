import test from 'ava';
import oggy from '..';
import fixtures from './fixtures';

const websites = fixtures.list('website');

const scraper = oggy();

websites.forEach(website => {
	test(website, async t => {
		const fixture = fixtures.use(`website.${website}`);
		const res = await scraper.scrape(fixture.url);

		t.truthy(res.oggyfied);
		t.deepEqual(res.oggyfied, fixture.oggyfied);
	});
});

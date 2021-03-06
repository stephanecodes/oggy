import test from 'ava';
import oggy from '..';
import sampleHook from '../hooks/sample';
import fixtures from './fixtures';

test('url is hooked', async t => {
	const scraper = oggy({hooks: [sampleHook()]});
	const res = await scraper.urlIsHooked(fixtures.defaults.url);

	t.true(res);
});

test('url is not hooked', async t => {
	const scraper = oggy({hooks: [sampleHook()]});
	const res = await scraper.urlIsHooked('https://www.bttf.com');

	t.false(res);
});

test('change metadata title', async t => {
	const scraper = oggy({hooks: [sampleHook()]});
	const fixture = fixtures.use('boilerplate.basic');
	const res = await scraper.scrape(fixture.url);

	t.truthy(res.oggyfied);
	t.is(res.oggyfied.title, '/// Hooked ///');
});

[
	{uid: 'u01', fullName: 'Marty McFly'},
	{uid: 'u02', fullName: 'Emmett Brown'},
	{uid: 'u03', fullName: 'Lorraine Baines'},
	{uid: 'u04', fullName: 'Biff Tannen'},
	{uid: 'u05', fullName: 'Jennifer Parker'}
]
	.forEach(user => {
		test(`change metadata title by adding user context information '${user.fullName}'`, async t => {
			const scraper = oggy({hooks: [sampleHook()]});
			const fixture = fixtures.use('boilerplate.basic');
			const res = await scraper.scrape(fixture.url, {context: {user}});

			t.truthy(res.oggyfied);
			t.true(res.oggyfied.title.indexOf(`/// Hooked for ${user.fullName} ///`) !== -1);
		});
	});


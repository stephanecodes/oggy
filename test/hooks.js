import test from 'ava';
import oggy from '..';
import sampleHook from '../hooks/sample';
import fixtures from './fixtures';

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
			const res = await scraper.scrape(fixture.url, {user});

			t.truthy(res.oggyfied);
			t.true(res.oggyfied.title.indexOf(`/// Hooked for ${user.fullName} ///`) !== -1);
		});
	});


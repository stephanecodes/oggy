import test from 'ava';
import oggy from '..';
import sampleHook from '../hooks/sample';
import fixtures from './fixtures';

test('change metadata title', async t => {
	const scraper = oggy({hooks: [sampleHook()]});
	const fixture = fixtures.use('boilerplate.basic');
	const res = await scraper.scrape(fixture.url);

	t.truthy(res.metadata);
	t.is(res.metadata.title, '/// Hooked ///');
});

[
	'Marty McFly',
	'Emmett Brown',
	'Lorraine Baines',
	'Biff Tannen',
	'Jennifer Parker'
]
	.forEach(fullName => {
		test(`change metadata title by adding user context information '${fullName}'`, async t => {
			const scraper = oggy({hooks: [sampleHook()]});
			const fixture = fixtures.use('boilerplate.basic');
			const user = {fullName};
			const res = await scraper.scrape(fixture.url, {user});

			t.truthy(res.metadata);
			t.true(res.metadata.title.indexOf(`/// Hooked for ${user.fullName} ///`) !== -1);
		});
	});


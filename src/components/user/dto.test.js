const dto = require('./dto');

test('single, empty resource', () => {
	expect(dto.single()).toMatchObject({});
});

test('single, wrong object resource', () => {
	expect(dto.single({ some: 'some' })).toMatchObject({});
});

test('single, success', () => {
	expect(dto.single({ email: 'some' })).toHaveProperty('email');
});

test('multiple, not array', () => {
	expect(dto.multiple({ some: 'some' })).toMatchObject([]);
});

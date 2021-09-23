const lang = require('./lang');

// translate

test('translate, null language, null key', () => {
	expect(lang.translate()).toBe('');
});

test('translate, null language, not found key', () => {
	expect(lang.translate(null, 'eee')).toBe('');
});

test('translate, null language, existing key, english expected', () => {
	expect(lang.translate(null, 'registerSubject')).toBe('Confirm registration');
});

test('translate, unexisting language, existing key, english expected', () => {
	expect(lang.translate('--', 'registerSubject')).toBe('Confirm registration');
});

test('translate, existing language, unexisting key', () => {
	expect(lang.translate('en', '--')).toBe('');
});

test('translate, es language, registerSubject key, Confirmar registro expected', () => {
	expect(lang.translate('es', 'registerSubject')).toBe('Confirmar registro');
});

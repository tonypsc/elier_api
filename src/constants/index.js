function define(name, value) {
	Object.defineProperty(exports, name, {
		value: value,
		enumerable: true,
	});
}

define('CUSTOM_ERROR_CODE', 5000);
define('ACCESS_DENIED_MSG', 'Access denied.');

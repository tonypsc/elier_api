const lang = {
	definedLangs: ['EN', 'ES'], // list of defined languages

	/**
	 * Returns the string in the language needed
	 * @param {string} language
	 * @param {string} key
	 * @returns {string}
	 */
	translate(language = 'EN', key) {
		let resources;

		try {
			resources = require(`./${language.toLowerCase()}.json`);
		} catch {
			resources = require(`./en.json`);
		}

		return resources[key] || '';
	},
};

module.exports = lang;

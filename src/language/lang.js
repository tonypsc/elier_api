const lang = {
	translate(language = 'en', key) {
		let resources;

		try {
			resources = require(`./${language}.json`);
		} catch {
			resources = require(`./en.json`);
		}

		return resources[key] || '';
	},
};

module.exports = lang;

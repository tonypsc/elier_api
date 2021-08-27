const dateHelper = {
	/**
	 * converts a unix time stamp to date string
	 * @returns string
	 */
	getDateFromUts(uts, format = 'd-m-y') {
		if (!uts) return '';
		const date = new Date(uts);
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		return format.replace('y', year).replace('m', month).replace('d', day);
	},

	getDaysLeft(uts) {
		const diff = uts - Date.now();
		const daysLeft = diff / 1000 / 60 / 60 / 24;
		return daysLeft;
	},

	firstDayOfWeek(dateObject, firstDayOfWeekIndex) {
		const dayOfWeek = dateObject.getDay(),
			firstDayOfWeek = new Date(dateObject),
			diff =
				dayOfWeek >= firstDayOfWeekIndex
					? dayOfWeek - firstDayOfWeekIndex
					: 6 - dayOfWeek;
		firstDayOfWeek.setDate(dateObject.getDate() - diff);
		firstDayOfWeek.setHours(0, 0, 0, 0);

		return firstDayOfWeek;
	},

	getLastDayOfWeek(date) {
		const today = date.getDate();
		const dayOfTheWeek = date.getDay();
		date.setDate(today - dayOfTheWeek + 7);
		date.setHours(23, 59, 59, 999);
		return new Date(date);
	},

	getFirstDayOfWeek(date) {
		const today = date.getDate();
		const dayOfTheWeek = date.getDay();
		date.setDate(today - (dayOfTheWeek || 7));
		date.setHours(0, 0, 0, 0);
		return new Date(date);
	},
};

module.exports = dateHelper;

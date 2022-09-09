const CustomError = require('../../error/CustomError');

class ContactMessage {
	constructor(name, email, phone, message) {
		this.validate();
		this.name = name;
		this.email = email;
		this.phone = phone;
		this.message = message;
	}

	getName() {
		return this.name;
	}
	getEmail() {
		return this.email;
	}
	getPhone() {
		return this.phone;
	}
	getMessage() {
		return this.message;
	}
	validate(name) {
		if (!name || name.length > 80) throw new CustomError('Name (2-80 chars)');
	}
}

module.exports = ContactMessage;

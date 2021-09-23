const CustomError = require('../../error/CustomError');

class ContactMessage {
	constructor(name, email, phone, message) {
		this.validate();
		this.name = name;
		this.email = name;
		this.phone = name;
		this.message = name;
	}

	getName = () => this.name;
	getEmail = () => this.email;
	getPhone = () => this.phone;
	getMessage = () => this.message;
	validate = (name, email, phone, message) => {
		if (!name || name.length > 80) throw new CustomError('Name (2-80 chars)');
	};
}

module.exports = ContactMessage;

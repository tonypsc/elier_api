const fs = require('fs');
const path = require('path');

module.exports = {
	// Gets a unique file name in the folder
	getUniqueName(basePath, fileName) {
		let fullPath = path.resolve(basePath, fileName);
		const extension = fileName.substring(fileName.lastIndexOf('.') + 1);
		const pureFileName = fileName.substring(0, fileName.lastIndexOf('.'));
		let newFileName = pureFileName;

		let i = 1;

		while (fs.existsSync(fullPath)) {
			newFileName = pureFileName + i.toString();
			fullPath = path.resolve(basePath, newFileName + '.' + extension);
			i++;
		}

		return newFileName + '.' + extension;
	},

	getFileName(fullName) {
		return fullName.substring(0, fullName.lastIndexOf('.'));
	},

	getExtension(fileName) {
		return fileName.substring(fileName.lastIndexOf('.') + 1);
	},
};

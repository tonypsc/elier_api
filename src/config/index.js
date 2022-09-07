const path = require('path');
console.log(process.env.ENV);
const ENV = process.env.ENV || 'development';
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const envConfig = require(path.resolve(__dirname, './environments', ENV));

const defaultConfig = { ...envConfig, env: ENV };

module.exports = defaultConfig;

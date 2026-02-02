const bcrypt = require('bcryptjs');
const password = 'xingran8';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
console.log(hash);

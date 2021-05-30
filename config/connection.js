const mysql = require('mysql');
require("dotenv").config()

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  multipleStatements: true
});
 
connection.connect((err) => {
    if(err) {
        console.log(err)
        return
    }
});


module.exports = connection
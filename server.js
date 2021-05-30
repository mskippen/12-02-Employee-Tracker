const connection = require("./config/connection");
const express = require("express")
const app = express()

app.get("/", (req, res) => {
    const queryString = `SELECT * FROM role; SELECT CONCAT(first_name, " ", last_name) AS full_name FROM employee;`
    connection.query(queryString, (err, data) => {
        if(err) {
            console.log(err)
        } else {
            res.json(data)
        }})
})


app.listen(3000, () => console.log("app running"))
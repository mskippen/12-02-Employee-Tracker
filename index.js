const inquirer = require("inquirer");
const connection = require("./config/connection");
const express = require("express");
const app = express();
function getAllTableQuery() {
  return `SELECT em.id, em.first_name, em.last_name, r.title, d.name AS "Department", r.salary AS "Salary", CONCAT(em.first_name," ",em.last_name) AS "Manager"
    FROM employee em
    LEFT JOIN role r 
    ON r.id = em.role_id 
    LEFT JOIN department d 
    ON d.id = r.department_id
    LEFT JOIN employee m ON m.id = em.manager_id
    ORDER BY em.id;`;
}

function initApp() {
  inquirer
    .prompt({
      name: "initialChoice",
      type: "list",
      message: "what would you like to do?",
      choices: [
        "View All Employees",
        "View All Roles",
        "View All Departments",
        "Add Employee",
        "Add Roles",
        "Add Departments",
        "Update Employee Roles",
        "View Employees By Manager",
        "Delete Department",
        "Delete Roles",
        "Delete Employee",
      ],
    })
    .then((data) => {
      const answer = data.initialChoice;
      if (answer === "View All Employees") {
        showAllData();
      } else if (answer === "View All Roles") {
        showAllRoles();
      } else if (answer === "View All Departments") {
        showAllDepartments();
      } else if (answer === "Add Employee") {
        addEmployee();
      } else if (answer === "Add Roles") {
        addRoles();
      } else if (answer === "Add Departments") {
        addDepartments();
      } else if (answer === "Update Employee Roles") {
        updateEmpRoles();
      } else if (answer === "View Employees By Manager") {
        viewEmpByManager();
      }  else if (answer === "Delete Department") {
          deleteDepartments()
      } else if (answer === "Delete Roles") {
          deleteRoles()
      } else if (answer === "Delete Employee") {
          deleteEmployee()
      }
    });
}

function showAllData() {
  connection.query(getAllTableQuery(), function (error, results) {
    if (error) throw error;
    console.table(results);
    initApp();
  });
}

function showAllRoles() {
  const queryString = `SELECT title AS Title from role`;
  connection.query(queryString, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.table(data);
      initApp();
    }
  });
}

function showAllDepartments() {
  const queryString = `SELECT name AS "Departments" from department`;
  connection.query(queryString, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.table(data);
      initApp();
    }
  });
}

function addEmployee() {
  const queryString = `SELECT * FROM role; SELECT CONCAT(first_name, " ", last_name) AS full_name FROM employee;`;
  connection.query(queryString, (err, data) => {
    const roleChoices = data[0].map((choice) => choice.title);
    const managerChoices = data[1].map((choice) => choice.full_name);
    console.log(roleChoices);
    console.log(managerChoices);
    inquirer
      .prompt([
        {
          name: "firstName",
          type: "input",
          message: "Enter First Name",
        },
        {
          name: "lastName",
          type: "input",
          message: "Enter Last Name",
        },
        {
          name: "role",
          type: "list",
          choices: roleChoices,
          message: "Select the employee role",
        },
        {
          name: "manager",
          type: "list",
          choices: managerChoices,
          message: "Select the manager of the employee",
        },
      ])
      .then((answer) => {
        const insertEmpQuery = `INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES("${answer.firstName}", "${answer.lastName}",
            (SELECT id FROM role WHERE title = "${answer.role}"),
            (SELECT id FROM (SELECT id FROM employee WHERE CONCAT(first_name, " ", last_name) = "${answer.manager}") temp));`;
        connection.query(insertEmpQuery, (err, response) => {
          if (err) throw err;

          console.table(response);
          initApp();
        });
      });
  });
}

function addRoles() {
  const queryString = `SELECT * FROM department;`;
  connection.query(queryString, (err, data) => {
    const choiceArray = data.map((choice) => choice.name);

    inquirer
      .prompt([
        {
          name: "title",
          type: "input",
          message: "Enter Role Title",
        },
        {
          name: "salary",
          type: "input",
          message: "Set the role Salary",
        },
        {
          name: "department",
          type: "list",
          choices: choiceArray,
          message: "Select the department for the role",
        },
      ])
      .then((answer) => {
        const insertRoleQuery = `INSERT INTO role(title, salary, department_id) VALUES("${answer.title}", "${answer.salary}", (SELECT id FROM department WHERE name = "${answer.department}" LIMIT 1));`;

        connection.query(insertRoleQuery, (err, response) => {
          if (err) throw err;

          console.table(response);
          initApp();
        });
      });
  });
}

function addDepartments() {
  inquirer
    .prompt([
      {
        name: "department",
        type: "input",
        message: "Enter Department Name",
      },
    ])
    .then((answer) => {
      connection.query(
        `INSERT INTO department(name) VALUES("${answer.department}")`,
        (err, result) => {
          if (err) throw err;

          initApp();
        }
      );
    });
}

function updateEmpRoles() {
  const queryString = `SELECT CONCAT (first_name," ",last_name) AS full_name FROM employee; SELECT title FROM role`;

  connection.query(queryString, (err, data) => {
    if (err) throw err;
    let choiceArray = data[0].map((choice) => choice.full_name);
    let roleChoices = data[1].map((choice) => choice.title);

    inquirer
      .prompt([
        {
          name: "employee",
          type: "list",
          choices: choiceArray,
          message: "Choose an employee to update their role",
        },
        {
          name: "newRole",
          type: "list",
          choices: roleChoices,
          message: "Choose a role to update with",
        },
      ])
      .then((answer) => {
        const newRoleQuery = `UPDATE employee 
              SET role_id = (SELECT id FROM role WHERE title = "${answer.newRole}" ) 
              WHERE id = (SELECT id FROM(SELECT id FROM employee WHERE CONCAT(first_name," ",last_name) = "${answer.employee}") AS temptable)`;
        connection.query(newRoleQuery, (err, result) => {
          if (err) throw err;

          console.table(result);
          initApp();
        });
      });
  });
}

function viewEmpByManager() {
  connection.query("SELECT name FROM department", (err, response) => {
    inquirer
      .prompt([
        {
          name: "role",
          type: "list",
          choices: response.map((choice) => choice.name),
          message: "Choose employee role",
        },
      ])
      .then((answer) => {
        const queryString = `SELECT CONCAT (e.first_name," ",e.last_name) AS full_name, r.title, d.name FROM employee e INNER JOIN role r ON r.id = e.role_id INNER JOIN department d ON d.id = r.department_id WHERE name = "${answer.role}";`;
        connection.query(queryString, (err, data) => {
          if (err) throw err;
          console.table(data);

          inquirer
            .prompt([
              {
                name: "manager",
                type: "list",
                choices: data.map((choice) => choice.full_name),
              },
            ])
            .then((result) => {
              const query2 = `SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title AS "Title", d.name AS "Department", r.salary AS "Salary", CONCAT(m.first_name," ",m.last_name) AS "Manager"
                    FROM employee e
                    LEFT JOIN role r
                    ON r.id = e.role_id
                    LEFT JOIN department d
                    ON d.id = r.department_id
                    LEFT JOIN employee m ON m.id = e.manager_id
                    WHERE CONCAT(m.first_name," ",m.last_name) = "${result.manager}";`;

              connection.query(query2, (err, response) => {
                if (err) {
                  console.log(err);
                } else {
                  console.table(response);
                  initApp();
                }
              });
            });
        });
      });
  });
}

function deleteDepartments()  {
    connection.query(`SELECT * FROM department`, (err, data) => {
        if (err) throw err;

        inquirer.prompt([{
            name: "department",
            type: "list",
            choices: data.map(i => i.name),
            message: "select a Department to delete"
        }])
        .then(answer => {
            connection.query(
                `DELETE FROM department WHERE name="${answer.department}"; `,
                (err, res) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.table(res);
                    initApp();
                  }
                }
              );
        })
    })
}

function deleteRoles()  {
    connection.query(`SELECT * FROM role`, (err, data) => {
        if (err) throw err;

        inquirer.prompt([{
            name: "role",
            type: "list",
            choices: data.map(i => i.title),
            message: "select a Role to delete"
        }])
        .then(answer => {
            connection.query(
                `DELETE FROM role WHERE title="${answer.role}"; `,
                (err, res) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.table(res);
                    initApp();
                  }
                }
              );
        })
    })
}

function deleteEmployee() {
    connection.query(getAllTableQuery(), (err, data) => {
        if (err) throw err;
        console.table(data)

        connection.query(`SELECT id FROM employee`, (err, res) => {
            inquirer.prompt([
                {
                    name: "ID",
                    type: "list",
                    choices: res.map(i => i.id),
                    message: "Choose Employee by ID to delete"
                }
            ])
            .then(answer => {
                connection.query(`DELETE FROM employee WHERE id = "${answer.ID}"`, (err, res) => {
                    if(err) {
                        console.log(err)
                    } else {
                        initApp()
                    }
                })
            })
        })
    })
}

initApp();

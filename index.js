
const inquirer = require("inquirer");
const mysql = require("mysql");
const consoletable = require("console.table")

const connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",
 
    password: "CoolP001Par7y!",
    database: "employees_db"
  });
  
  connection.connect(function(err) {
    if (err) throw (err);
    console.log("Sarvay's Employee Tracker");
    employeeTracker();
  });

function employeeTracker() {
    inquirer.prompt({
        type: "list",
        name: "initial",
        message: "What would you like to do?",
        choices: [
            "Add Department",
            "Add Role",
            "Add Employee",
            "View Departments",
            "View Roles",
            "View Employees",
            "Update Employee Role",
            "Nothing"
        ]
    }).then(function(response){
        switch(response.initial) {
            case "Add Department":
                addDepartment();
                break;
            case "Add Role":
                addRole();
                break;
            case "Add Employee":
                addEmployee();
                break;
            case "View Departments":
                viewDepartments();
                break;
            case "View Roles":
                viewRoles();
                break;
            case "View Employees":
                viewEmployees();
                break;
            case "Update Employee Role":
                updateEmployee();
                break;
            case "Nothing":
                connection.end();
                break;
        };
    });
};

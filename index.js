const inquirer = require("inquirer");
const mysql = require("mysql");
const consoletable = require("console.table")

const connection = mysql.createConnection({
    URL: "localhost",

    port: 3306,

    user: "root",
 
    password: "password",
    database: "employees_db"
  });
  connection.connect(function(err) {
    if (err) throw (err);
    console.log("Employee Tracker");
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

function addDepartment(){
    inquirer.prompt({
        type: "input",
        name: "department",
        message: "What is the name of the new department you would like to add?"
    }).then(function(response){
        console.log("Adding Department...\n");
        connection.query(
            "INSERT INTO department SET ?",
            {
                department_name: response.department
            },
            function(err, res) {
                if (err) throw (err);
                console.log("Department updated");
                
                employeeTracker();
            }
        );
    });
};


function addRole() {
    connection.query("SELECT * FROM department", function(err, res){
        if (err) throw (err);
        let data = [];
        for(var i = 0; i < res.length; i++){
            data.push(res[i].department_name);
        }
        inquirer.prompt([
            {
                type: "list",
                name: "department",
                message: "Which department is getting the new role?",
                choices: data
            },
            {
                type: "input",
                name: "role",
                message: "What is the new role you would like to add?"
            },
            {
                type: "input",
                name: "salary",
                message: "What is this role's salary?"
            }
        ]).then(function(response){
            connection.query("SELECT * FROM department where department_name=?", [response.department], function(err, res){
                let id = res[0].department_id;
                connection.query("INSERT INTO roles SET ?",
                {
                    title: response.role,
                    salary: response.salary,
                    department_id: id
                },
                function(err, res){
                    if (err) throw (err);
                    console.log("Role Added!");
                    employeeTracker();
                });
            });
        });
    });
};


function addEmployee() {
    connection.query("SELECT * FROM roles", function(err, res){
        if (err) throw (err);
        let data = [];
        for (var i = 0; i < res.length; i++){
            data.push(res[i].title);
        };
        let dataTwo = ["none"];
        connection.query("SELECT * FROM employee", function(err, res){
            if (err) throw (err);
            for (var j = 0; j < res.length; j++){
                dataTwo.push(res[j].first_name);
            };
            inquirer.prompt([
            {
                type: "input",
                name: "first",
                message: "What is the employee's first name?"
            },
            {
                type: "input",
                name: "last",
                message: "What is the employee's last name?"
            },
            {
                type: "list",
                name: "role",
                message: "What is the employee's job title?",
                choices: data
            },
            {
                type: "list",
                name: "manager",
                message: "Who is the Employee's Manager?",
                choices: dataTwo
            }
        ]).then(function(response){
            let mgr = null;
            if (response.manager != "none"){
                connection.query("SELECT * FROM employee WHERE first_name=?", [response.manager], function(err, res){
                    if (err) throw (err);
                    mgr = res[0].employee_id;
                });
            };
            connection.query("SELECT * FROM roles WHERE title=?", [response.role], function(err, res){
                if (err) throw (err);
                let id = res[0].role_id;
                connection.query("INSERT INTO employee SET ?",
                {
                    first_name: response.first,
                    last_name: response.last,
                    role_id: id,
                    manager_id: mgr
                },
                function(err, res){
                    if (err) throw (err);
                    console.log("Employee Added!");
                    employeeTracker();
                });
            });
        });
    });
    });
};


function viewDepartments() {
    connection.query("SELECT * FROM department", function(err, res){
        if (err) throw (err);
        let data = [];
        for (var n = 0; n < res.length; n++){
            data.push(res[n].department_name);
        };
        inquirer.prompt(
            {
            type: "list",
            name: "department",
            message: "Which Department would you like to view?",
            choices: data
            }
        ).then(function(response){
            connection.query("SELECT * FROM department WHERE department_name=?", [response.department], function(err, res){
                if (err) throw (err);
                let id = res[0].department_id;
                connection.query("SELECT * FROM department INNER JOIN roles ON roles.department_id = department.department_id INNER JOIN employee ON employee.role_id = roles.role_id WHERE department.department_id = ?", [id], function(err, res){
                    if (err) throw (err);
                    console.table(res);
                    employeeTracker();
                });
            });
        });
    });
};

function viewRoles() {
    connection.query("SELECT * FROM roles", function(err, res){
        if (err) throw (err);
        let data = [];
        for (var h = 0; h < res.length; h++){
            data.push(res[h].title);
        };
        inquirer.prompt(
            {
            type: "list",
            name: "role",
            message: "Which Role would you like to view?",
            choices: data
            }
        ).then(function(response){
            connection.query("SELECT * FROM roles WHERE title=?", [response.role], function(err, res){
                if (err) throw (err);
                let id = res[0].role_id;
                connection.query("SELECT * FROM department INNER JOIN roles ON roles.department_id = department.department_id INNER JOIN employee ON employee.role_id = roles.role_id WHERE roles.role_id = ?", [id], function(err, res){
                    if (err) throw (err);
                    console.table(res);
                    employeeTracker();
                });
            });
        });
    });
};

function viewEmployees() {
    connection.query("SELECT * FROM department INNER JOIN roles ON roles.department_id = department.department_id INNER JOIN employee ON employee.role_id = roles.role_id ORDER BY department.department_id", function(err, res){
        if (err) throw (err);
        console.table(res);
        employeeTracker();
    });
};

function updateEmployee() {
    connection.query("SELECT * FROM employee", function(err, res){
        if (err) throw (err);
        let data = [];
        for(var e = 0; e < res.length; e++){
            data.push(res[e].first_name);
        };
        connection.query("SELECT * FROM roles", function(err, res){
            let dataTwo = [];
            for(var a = 0; a < res.length; a++){
                dataTwo.push(res[a].title);
            };
            inquirer.prompt([
                {
                    type: "list",
                    name: "employee",
                    message: "Which employee's role would you like to update?",
                    choices: data
                },
                {
                    type: "list",
                    name: "role",
                    message: "What is that employee's new role?",
                    choices: dataTwo
                }
            ]).then(function(response){
                let id = "";
                connection.query("SELECT * FROM roles WHERE title=?", [response.role], function(err, res){
                    id = res[0].role_id;
                connection.query("UPDATE employee SET ? WHERE ?",
                [
                    {
                        role_id: id
                    },
                    {
                        first_name: response.employee
                    }
                ],
                function(err, res){
                    if (err) throw (err);
                    console.log(response.employee + "'s Role Updated to " + response.role);
                    employeeTracker();
                });
            });
            });
        });
    });
};
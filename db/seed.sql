INSERT INTO department(name)
VALUES
('Service Department'),
('Finance Department'),
('Production Department'),
('Quality Assurance Department'),
('Finance Department'),
('HR Department'),
('Marketing Department');

INSERT INTO role(title, salary, department_id)
VALUES
('Production Assistant', 40000, 2),
('Customer Service Rep', 67000, 1),
('Marketing Specialist', 72000, 7),
('Business Analyst', 90000, 4),
('Human Resource Personnel', 60000, 6),
('Accountant', 89000, 5);

INSERT INTO employee(first_name, last_name, role_id)
VALUES
('James', 'Tyler', 1),
('John', 'Botham', 5),
('Mary', 'Manson', 2),
('Marilyn', 'Monroe', 3),
('Scott', 'Floyd', 6),
('Isreal', 'Folau', 3);
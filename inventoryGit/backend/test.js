const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MySQL connection setup
// Setup database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
  
  // Sample data
  const users = [
    { username: 'manager', password: 'password', role: 'manager' },
    { username: 'billPerson', password: 'password', role: 'billPerson' }
  ];

  // Hash passwords before inserting
  users.forEach(user => {
    bcrypt.hash(user.password, 10, (err, hashedPassword) => {
      if (err) throw err;
      // Insert user with hashed password
      const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
      db.execute(query, [user.username, hashedPassword, user.role], (err, result) => {
        if (err) throw err;
        console.log(`User ${user.username} inserted with hashed password`);
      });
    });
  });

});

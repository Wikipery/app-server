const mysql = require('mysql2');

// Create a connection to the AWS RDS database
const connection = mysql.createConnection({
  host: 'database-1.cluster-clym08mke1hi.eu-west-1.rds.amazonaws.com', // Replace with your RDS endpoint
  user: 'admin',                   // Replace with your username
  password: 'your-master-password',               // Replace with your password
  database: 'your-database-name',                 // Replace with your database name
  port: 3306,                                     // Default MySQL port
});

// Test the connection
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the AWS RDS database:', err);
    return;
  }
  console.log('Successfully connected to AWS RDS MySQL database.');

  // Example query
  connection.query('SELECT NOW()', (error, results) => {
    if (error) throw error;
    console.log('Query Result:', results);
    connection.end(); // Close the connection
  });
});

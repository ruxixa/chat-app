const mysql = require("mysql2");
const appConfig = require("../../appConfig.json");

class Database {
  static connection = null;
  static connect() {
    Database.connection = mysql.createConnection({
      host: appConfig.db.host,
      user: appConfig.db.user,
      password: appConfig.db.password,
      database: appConfig.db.database,
    });

    Database.connection.connect((err) => {
      if (err) {
        console.error("DB connection error: " + err.stack);
        return;
      }
      console.log("Connected to MySQL. ID: " + Database.connection.threadId);
    });
  }

  static query(sql, params, callback) {
    if (!Database.connection) {
      console.error("No database connection.");
      return;
    }

    Database.connection.query(sql, params, (err, results, fields) => {
      if (err) {
        console.error("Query error: " + err.stack);
        if (callback) callback(err, null);
        return;
      }
      if (callback) callback(null, results);
    });
  }

  static end() {
    if (!Database.connection) {
      console.error("No database connection.");
      return;
    }

    Database.connection.end((err) => {
      if (err) {
        console.error("Failed to close database connection: " + err.stack);
        return;
      }
      console.log("Closed database connection.");
    });
  }
}

module.exports = Database;

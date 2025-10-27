// db.js
import mysql from "mysql";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "blogdb",
  connectionLimit: 10, // max concurrent connections
});

db.on("error", (err) => {
  console.error("Database error:", err);
});

export default db; // correct ES module export

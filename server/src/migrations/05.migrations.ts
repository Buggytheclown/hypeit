export function migration05(connection, fn) {
  connection.query(
      `CREATE TABLE IF NOT EXISTS users (
        user_id  INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name     VARCHAR(256) UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `,
    fn,
  );
}

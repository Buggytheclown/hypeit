export function migration07(connection, fn) {
  connection.query(
      `CREATE TABLE IF NOT EXISTS opened_users_posts (
        seen_users_posts_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        posts_id            INT,
        user_id             INT,
        UNIQUE KEY (posts_id, user_id),
        CONSTRAINT
        FOREIGN KEY (posts_id)
        REFERENCES posts (posts_id)
          ON UPDATE CASCADE
          ON DELETE CASCADE,
        CONSTRAINT
        FOREIGN KEY (user_id)
        REFERENCES users (user_id)
          ON UPDATE CASCADE
          ON DELETE CASCADE
      );
    `,
    fn,
  );
}

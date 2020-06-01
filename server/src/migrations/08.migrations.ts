export function migration08(connection, fn) {
  connection.query(
      `CREATE TABLE IF NOT EXISTS events (
        event_id INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
        title    TEXT,
        link     VARCHAR(255) NOT NULL UNIQUE,
        time     DATETIME     NOT NULL
      );

      CREATE TABLE IF NOT EXISTS seen_users_events (
        seen_users_events_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        events_id            INT,
        user_id              INT,
        UNIQUE KEY (events_id, user_id),
        CONSTRAINT
        FOREIGN KEY (events_id)
        REFERENCES events (event_id)
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

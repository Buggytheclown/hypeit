export function migration09(connection, fn) {
  connection.query(
    `ALTER TABLE opened_users_posts ADD COLUMN datetime DATETIME;

    ALTER TABLE seen_users_posts ADD COLUMN datetime DATETIME;`,
    fn,
  );
}

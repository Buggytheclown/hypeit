export function migration(connection, fn) {
  connection.query(
    `ALTER TABLE posts
        ADD COLUMN total_views INT,
        ADD COLUMN total_votes INT;`,
    fn,
  );
}

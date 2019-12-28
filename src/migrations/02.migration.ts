export function migration02(connection, fn) {
  connection.query(
    `ALTER TABLE posts
        ADD COLUMN total_views INT,
        ADD COLUMN total_votes INT,
        ADD COLUMN voter_count INT,
        ADD COLUMN clap_count INT;

      INSERT INTO resources (name, link)
        VALUES ('medium', 'medium.com');
    `,
    fn,
  );
}

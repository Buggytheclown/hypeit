export function migration04(connection, fn) {
  connection.query(
    `ALTER TABLE posts
        ADD COLUMN score INT;

      INSERT INTO resources (name, link)
        VALUES ('devto', 'https://dev.to');

      UPDATE resources SET link = 'https://habr.com' WHERE name = 'habr';
      UPDATE resources SET link = 'https://medium.com' WHERE name = 'medium';

      ALTER TABLE resources
          RENAME COLUMN logo to favicon;

      UPDATE resources SET favicon = 'https://habr.com/images/favicon-32x32.png' WHERE name = 'habr';
      UPDATE resources SET favicon = 'https://cdn-static-1.medium.com/_/fp/icons/favicon-rebrand-medium.3Y6xpZ-0FSdWDnPM3hSBIA.ico' WHERE name = 'medium';
      UPDATE resources SET favicon = 'https://dev-to.s3.us-east-2.amazonaws.com/favicon.ico' WHERE name = 'devto';
    `,
    fn,
  );
}

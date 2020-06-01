export function migration03(connection, fn) {
  connection.query(
    `ALTER DATABASE ${connection.config.database} CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
      ALTER TABLE tags CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      ALTER TABLE posts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `,
    fn,
  );
}

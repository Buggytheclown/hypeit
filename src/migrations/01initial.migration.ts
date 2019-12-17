// `ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';
// ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
// SELECT plugin FROM mysql.user WHERE User = 'root';
// `;

export function migration(connection, fn) {
  connection.query(
    `CREATE TABLE IF NOT EXISTS resources(
  resources_id INT NOT NULL AUTO_INCREMENT,
  name TEXT,
  link TEXT,
  logo TEXT,
  PRIMARY KEY (resources_id)
);
CREATE TABLE IF NOT EXISTS posts(
  posts_id INT NOT NULL AUTO_INCREMENT,
  external_posts_id VARCHAR(255) NOT NULL UNIQUE,
  title TEXT,
  time DATETIME,
  rawTime TEXT,
  link TEXT,
  rating INT,
  resources_id INT,
  CONSTRAINT
  FOREIGN KEY (resources_id)
    REFERENCES resources(resources_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
  PRIMARY KEY (posts_id)
);
CREATE TABLE IF NOT EXISTS tags(
  tags_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE,
  PRIMARY KEY (tags_id)
);
CREATE TABLE IF NOT EXISTS posts_tags(
  posts_tags_id INT NOT NULL AUTO_INCREMENT,
  posts_id INT,
  tags_id INT,
  PRIMARY KEY (posts_tags_id),
  CONSTRAINT
  FOREIGN KEY (posts_id)
    REFERENCES posts(posts_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
  CONSTRAINT
  FOREIGN KEY (tags_id)
    REFERENCES tags(tags_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
INSERT INTO resources (name, link)
VALUES ('habr', 'habr.com');`,
    fn,
  );
}

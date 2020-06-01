import { connection, execMigration, logOperation } from './migrations.helper';
import { migrationsList } from './migrationsList';

Promise.resolve()
  .then(() =>
    migrationsList.reduce(
      (acc, cur) => acc.then(() => logOperation(cur.name, execMigration(cur))),
      Promise.resolve(),
    ),
  )
  .catch(console.error)
  .finally(() => {
    connection.destroy();
  });

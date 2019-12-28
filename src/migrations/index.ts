import { migration01 } from './01.migration';
import { migration02 } from './02.migration';
import {
  clearBD,
  connection,
  execMigration,
  logOperation,
} from './migrations.helper';

const migrations = [clearBD, migration01, migration02];

Promise.resolve()
  .then(() =>
    migrations.reduce(
      (acc, cur) => acc.then(() => logOperation(cur.name, execMigration(cur))),
      Promise.resolve(),
    ),
  )
  .catch(console.error)
  .finally(() => {
    connection.destroy();
  });

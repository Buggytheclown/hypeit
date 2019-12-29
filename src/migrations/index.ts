import {
  clearBD,
  connection,
  execMigration,
  logOperation,
} from './migrations.helper';
import { migration01 } from './01.migration';
import { migration02 } from './02.migration';
import { migration03 } from './03.migration';

const migrations = [clearBD, migration01, migration02, migration03];

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

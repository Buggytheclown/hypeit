import {
  clearBD,
  connection,
  execMigration,
  logOperation,
} from './migrations.helper';
import { migration01 } from './01.migration';
import { migration02 } from './02.migration';
import { migration03 } from './03.migration';
import { migration04 } from './04.migrations';
import { migration05 } from './05.migrations';

const migrations = [
  clearBD,
  migration01,
  migration02,
  migration03,
  migration04,
  migration05,
];

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

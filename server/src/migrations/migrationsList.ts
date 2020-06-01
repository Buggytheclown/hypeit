import { clearBD } from './migrations.helper';
import { migration01 } from './01.migration';
import { migration02 } from './02.migration';
import { migration03 } from './03.migration';
import { migration04 } from './04.migrations';
import { migration05 } from './05.migrations';
import { migration06 } from './06.migrations';
import { migration07 } from './07.migrations';
import { migration08 } from './08.migrations';

export const migrationsList = [
  clearBD,
  migration01,
  migration02,
  migration03,
  migration04,
  migration05,
  migration06,
  migration07,
  migration08,
];

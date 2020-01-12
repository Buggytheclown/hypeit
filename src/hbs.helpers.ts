import * as _ from 'lodash';
import * as moment from 'moment';
import * as hbs from 'hbs';

export function registerHbsHelpers() {
  hbs.registerHelper('extendQuery', (options: any): string => {
    const queryParams = options.data.root.queryParams;
    const restQueryParams = _.omit(options.hash, 'queryParams');

    const extendedQueryParams = { ...queryParams, ...restQueryParams };

    return (
      '?' +
      Object.entries(extendedQueryParams)
        .map(([k, v]) => `${k}=${v}`)
        .join('&')
    );
  });

  hbs.registerHelper('moment', (options: any): string => {
    return moment(options).format('LLL');
  });

  hbs.registerHelper('get', (o, p): string => {
    return o[p];
  });

  hbs.registerHelper('math', (lvalue, operator, rvalue, options) => {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);

    return {
      '+': lvalue + rvalue,
      '-': lvalue - rvalue,
      '*': lvalue * rvalue,
      '/': lvalue / rvalue,
      '%': lvalue % rvalue,
    }[operator];
  });

  hbs.registerHelper('cmp', (lvalue, operator, rvalue, options) => {
    const operation = {
      '>': lvalue > rvalue,
      '>=': lvalue >= rvalue,
      '<': lvalue < rvalue,
      '<=': lvalue <= rvalue,
      '===': lvalue === rvalue,
      '!==': lvalue !== rvalue,
    };
    if (!(operator in operation)) {
      throw new TypeError(`operator: ${operator} not in operation`);
    }
    return operation[operator];
  });

  hbs.registerHelper('object', ({ hash }) => hash);
}

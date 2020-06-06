import React from 'react';

const Pagination = ({ count = 1 }: { count: number }) => (
  <div>
    <button type="button">prev</button>
    <button type="button">{count || 1}</button>
    <button type="button">next</button>
  </div>
);

export default Pagination;

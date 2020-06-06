import React from 'react';

type Props = {
  link: string;
  name: string;
};

const Tag = ({ link, name }: Props): JSX.Element => (
  <a href={link}>{`#${name}`}</a>
);

export default Tag;

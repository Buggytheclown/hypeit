import React from 'react';
import './theme-selector.modules.css';
import { ThemeStatus } from '../../types';

interface IProps {
  status: ThemeStatus;
  onChange: (status: ThemeStatus) => void;
}

export const ThemeSelector = ({ status = 'dark', onChange }: IProps) => {
  console.log(status);

  return (
    <div className="theme-selector">
      <label className="theme-selector__label" htmlFor="theme-selector">
        <input
          onChange={() => onChange(status === 'light' ? 'dark' : 'light')}
          type="checkbox"
          id="theme-selector"
        />
        <span className="theme-selector__round" />
      </label>
    </div>
  );
};

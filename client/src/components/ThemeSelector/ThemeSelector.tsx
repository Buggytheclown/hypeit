import React from 'react';
import './theme-selector.modules.css';

type Status = {
  status: 'dark' | 'light';
};
interface IProps {
  status: 'dark' | 'light';
  onChange: (status: Status) => void;
}

export const ThemeSelector = ({ status = 'dark', onChange }: IProps) => (
  <div className="theme-selector">
    <label className="theme-selector__label" htmlFor="theme-selector">
      <input type="checked" id="theme-selector" />
      <span className="theme-selector__round" />
    </label>
  </div>
);

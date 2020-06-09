import React from 'react';
import './theme-selector.modules.css';
import { ThemeStatus } from '../../types';

interface IProps {
  status: ThemeStatus;
  onChange: (status: ThemeStatus) => void;
}

export const ThemeSelector = ({ status = ThemeStatus.DARK, onChange }: IProps) => (
  <div className="theme-selector">
    <label className="theme-selector__label" htmlFor="theme-selector">
      <input
        onChange={() => onChange(
          status === ThemeStatus.LIGHT
            ? ThemeStatus.DARK
            : ThemeStatus.LIGHT,
        )}
        type="checkbox"
        id="theme-selector"
      />
      <span className="theme-selector__round" />
    </label>
  </div>
);

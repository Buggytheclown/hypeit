import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import Pagination from './components/Pagination/Pagination';
import { ThemeSelector } from './components/ThemeSelector/ThemeSelector';
import { ThemeStatus } from './types';

export const App = () => {
  const [themeSelector, setThemeSelector] = useState<ThemeStatus>('dark');
  const [theme, setTheme] = useState<ThemeStatus>('dark');

  useEffect(() => {
    setTheme(themeSelector);
  }, [themeSelector]);

  return (
    <div className="App" data-theme={theme}>
      <div className="container">
        <Header />
        <div>
          <div className="feed">
            <div className="feed__navigation" />
            <div className="feed__count" />
            <div className="news-wrapper">
              <div className="news" />
            </div>
            <Pagination count={1} />
          </div>
        </div>
      </div>
      <ThemeSelector status={themeSelector} onChange={setThemeSelector} />
    </div>
  );
};

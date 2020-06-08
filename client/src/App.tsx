import React, { useState } from 'react';
import Header from './components/Header/Header';
import Pagination from './components/Pagination/Pagination';
import { ThemeSelector } from './components/ThemeSelector/ThemeSelector';
import { ThemeStatus } from './types';

export const App = () => {
  const [theme, setTheme] = useState<ThemeStatus>(ThemeStatus.DARK);

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
      <ThemeSelector status={theme} onChange={setTheme} />
    </div>
  );
};

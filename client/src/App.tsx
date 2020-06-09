import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import { Header } from './components/Header/Header';
import Pagination from './components/Pagination/Pagination';
import { About } from './components/About/About';
import { ThemeSelector } from './components/ThemeSelector/ThemeSelector';
import { ThemeStatus } from './types';

export const App = () => {
  const [theme, setTheme] = useState<ThemeStatus>(ThemeStatus.DARK);

  return (
    <Router>
      <div className="App" data-theme={theme}>
        <div className="container">
          <Header />
          <main className="main-content">
            <Switch>
              <Route activeClassName="selected" path="/about">
                <About />
              </Route>
              <div className="feed__navigation" />
              <div className="feed__count" />
              <div className="news-wrapper">
                <div className="news" />
              </div>
              <Pagination count={1} />
            </Switch>
          </main>
        </div>
        <ThemeSelector status={theme} onChange={setTheme} />
      </div>
    </Router>
  );
};

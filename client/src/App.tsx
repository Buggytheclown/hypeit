import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// Other
import { Header } from './components/Header/Header';
import { Pagination } from './components/Pagination/Pagination';
import { About } from './components/About/About';
import { Feeds } from './containers/Feeds/Feeds';
import { FeedFilter } from './components/FeedFilter/FeedFilter';
import { ThemeSelector } from './components/ThemeSelector/ThemeSelector';
import { ThemeStatus } from './types';
import { NewsList } from './components/News/NewsList';
import { Auth } from './components/Auth/Auth';
// styles
import styles from './app.module.css';

// mock
import { news } from './mocks/news';

export const App = () => {
  const [theme, setTheme] = useState<ThemeStatus>(ThemeStatus.DARK);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <Router>
      <div className="App">
        <div className="container">
          <Header />
          <main className={styles.mainContainer}>
            <Switch>
              <Route path="/about">
                <About />
              </Route>
              <Route path="/" exact>
                <Feeds />
                <FeedFilter />
                <NewsList news={news} />
                <Pagination count={1} />
              </Route>
              <Route path="/auth">
                <Auth />
              </Route>
            </Switch>
          </main>
        </div>
        <ThemeSelector status={theme} onChange={setTheme} />
      </div>
    </Router>
  );
};

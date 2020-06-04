import React from 'react';
import Header from './components/Header/Header';
import Pagination from './components/ui/Pagination/Pagination';

function App() {
  return (
    <div className="App">
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
    </div>
  );
}

export default App;

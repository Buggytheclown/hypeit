import React from 'react';

const navigation = [
  {
    id: 1,
    name: 'About',
    icon: '',
  },
  {
    id: 2,
    name: 'Feed',
    icon: '',
  },
  {
    id: 3,
    name: 'Auth',
    icon: '',
  },
];

function App() {
  const navigationJSX = navigation.map((item) => (
    <li key={item.id} className="nav-item">
      {item.name}
    </li>
  ));

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <nav className="navigation">
            <ul>{navigationJSX}</ul>
          </nav>
        </header>
        <div>
          <div className="feed">
            <div className="feed-navigation" />
            <div className="feed-count" />
            <div className="news-wrapper">
              <div className="news" />
            </div>
            <div className="pagination" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

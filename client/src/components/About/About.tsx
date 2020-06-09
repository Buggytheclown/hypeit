import React from 'react';
import styles from './about.module.css';

export const About = () => (
  <div className={styles.aboutContainer}>
    <h3 className={styles.about__title}>About</h3>
    <ul>
      <li>
        <a href="https://github.com/Buggytheclown/hypeit" className="link" target="_blank" rel="noopener noreferrer">Open source </a>
        news aggregator (sources: Medium, Habr, DevTo).
      </li>
      <li>
        Sorted by relative rating:
        <ul className={styles.about__info}>
          <li>- Habr rating is `totalVotes`,</li>
          <li>- Medium rating is `voterCount` // `!clapCount`</li>
          <li>
            - Devto rating is `score/5` // `5` -
            magic number for the correct placement of posts among others
          </li>
        </ul>
      </li>
      <li>
        For registered users, we hide viewed messages and allow to make bookmarks.
      </li>
      <li>Medium posts can be proxed to remove any JS and cookies</li>
      <li>
        Show events (only dev.by currently),
        logged in user can manually hide the viewed events
      </li>
    </ul>
    <p>
      For any suggestions or bug report you can contact:
      <a className="link" href="mailto: buggy.the.clown.md@gmail.com"> buggy.the.clown.md@gmail.com</a>
    </p>
  </div>
);

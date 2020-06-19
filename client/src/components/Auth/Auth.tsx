import React, { useState } from 'react';

import SignIn from './SignIn';
import SignUp from './SignUp';

// styles
import styles from './auth.module.css';

enum AuthType {
  SIGNIN = 'SIGNIN',
  SIGNUP = 'SIGNUP',
}

export const Auth = () => {
  const [type, setType] = useState<string>(AuthType.SIGNIN);

  const submitHandlerSignIn = (e: React.SyntheticEvent) => {
    e.preventDefault();
  };

  const submitHandlerSignUp = (e: React.SyntheticEvent) => {
    e.preventDefault();
  };
  return (
    <div className={styles.authForm}>
      <div className={styles.authTabs}>
        <button
          className={`${styles.tabsButton} ${
            type === AuthType.SIGNIN && styles.tabsButton_active
          }`}
          onClick={() => setType(AuthType.SIGNIN)}
          type="button"
        >
          Войти
        </button>
        <button
          className={`${styles.tabsButton} ${
            type === 'signUp' && styles.tabsButton_active
          }`}
          onClick={() => setType(AuthType.SIGNUP)}
          type="button"
        >
          Зарегестрироваться
        </button>
      </div>
      {type === AuthType.SIGNIN && (
        <SignIn submitHandler={submitHandlerSignIn} />
      )}
      {type === AuthType.SIGNUP && (
        <SignUp submitHandler={submitHandlerSignUp} />
      )}
    </div>
  );
};

import React, { useState } from 'react';

import SignIn from './SignIn';
import SignUp from './SignUp';

// styles
import styles from './auth.module.css';

export const Auth = () => {
  const [type, setType] = useState<string>('signIn');

  const submitHandlerSignIn = (e: any) => {
    e.preventDefault();
    console.log(e, 'submitHandlerSignIn');
  };

  const submitHandlerSignUp = (e: any) => {
    e.preventDefault();
    console.log(e, 'submitHandlerSignUp');
  };
  return (
    <div className={styles.authForm}>
      <div className={styles.authTabs}>
        <button
          className={`${styles.tabsButton} ${
            type === 'signIn' && styles.tabsButton_active
          }`}
          onClick={() => setType('signIn')}
          type="button"
        >
          Войти
        </button>
        <button
          className={`${styles.tabsButton} ${
            type === 'signUp' && styles.tabsButton_active
          }`}
          onClick={() => setType('signUp')}
          type="button"
        >
          Зарегестрироваться
        </button>
      </div>
      {type === 'signIn' && <SignIn submitHandler={submitHandlerSignIn} />}
      {type === 'signUp' && <SignUp submitHandler={submitHandlerSignUp} />}
    </div>
  );
};

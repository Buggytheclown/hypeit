import React from 'react';

// styles
import styles from './auth.module.css';

const SignUp = ({ submitHandler }: any) => (
  <div>
    <form onSubmit={(e) => submitHandler(e)}>
      <input
        className={`${styles.formInput__auth} form-input`}
        type="text"
        placeholder="Username"
      />
      <input
        className={`${styles.formInput__auth} form-input`}
        type="password"
        placeholder="Password"
      />
      <input
        className={`${styles.formInput__auth} form-input`}
        type="password"
        placeholder="Password"
      />
      <button className="btn btn-default" type="submit">
        create account
      </button>
    </form>
  </div>
);

export default SignUp;

import React from 'react';

// styles
import styles from './auth.module.css';

interface IProp {
  (e: React.SyntheticEvent): void;
}

const SignIn = ({ submitHandler }: { submitHandler: IProp }) => (
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
      <button className="btn btn-default" type="submit">
        login
      </button>
    </form>
  </div>
);

export default SignIn;

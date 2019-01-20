import React, { Component, Fragment } from 'react';
import classNames from 'classnames';
import firebase from 'firebase/app';

import logo from '../../pokemon-battle-online-logo.png';
import { errors as firebaseErros } from '../../common/constants/firebase-errors';
import { TextField } from '../../common/components/form-fields';

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const SIGN_UP = 'signUp';
const LOG_IN = 'logIn';
const FORGOTTEN_PASSWORD = 'forgottenPassword';

export class Login extends Component {
  fields = {
    email: {
      label: 'Email',
      type: 'email',
      validator: email => emailRegex.test(email),
      errorMessage: 'Invalid email format',
    },
    password: {
      label: 'Password',
      type: 'password',
      validator: password => password && password.length > 5,
      errorMessage: 'Password must be at least 6 characters',
    },
    confirmPassword: {
      label: 'Confirm Password',
      type: 'password',
      validator: password => password === this.passwordRef.current.state.value,
      errorMessage: 'Passwords do not match',
    },
  };

  forms = {
    signUp: {
      fields: ['email', 'password', 'confirmPassword'],
      cta: {
        action: () => this.handleSignUp(),
        label: 'Sign Up',
      },
      subtext: [
        {
          action: () => this.goToForm(LOG_IN),
          key: 'goToLogIn',
          label: 'Already have an account?',
          link: 'Log In',
        },
      ],
    },
    logIn: {
      fields: ['email', 'password'],
      cta: {
        action: () => this.handleLogIn(),
        label: 'Log In',
      },
      subtext: [
        {
          action: () => this.goToForm(SIGN_UP),
          key: 'goToSignUp',
          label: "Don't have an account?",
          link: 'Sign Up Free',
        },
        {
          action: () => this.goToForm(FORGOTTEN_PASSWORD),
          key: 'goToForgottenPassword',
          label: 'Forgotten your password?',
          link: 'Reset',
        },
      ],
    },
    forgottenPassword: {
      fields: ['email'],
      cta: {
        action: () => this.handleForgottenPassword(),
        label: 'Send Recovery Email',
      },
      subtext: [
        {
          action: () => this.goToForm(LOG_IN),
          key: 'goToLogIn',
          link: 'Return To Log In',
        },
      ],
    },
  };

  state = {
    type: LOG_IN,
    focussed: undefined,
    error: undefined,
    isFormValid: false,
  };

  componentDidMount() {
    window.addEventListener('keyup', this.handleKeyUp);
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  handleKeyUp = e => {
    if (e.key === 'Enter') {
      const { type } = this.state;
      const {
        cta: { action },
      } = this.forms[type];
      this.handleCta(action);
    }
  };

  handleLogIn = () => {
    const { emailRef, passwordRef } = this;
    firebase
      .auth()
      .signInWithEmailAndPassword(emailRef.current.state.value, passwordRef.current.state.value)
      .catch(err => {
        console.log(err);
        this.setState({ error: err.code });
      });
  };

  handleSignUp = () => {
    const { emailRef, passwordRef } = this;
    firebase
      .auth()
      .createUserWithEmailAndPassword(emailRef.current.state.value, passwordRef.current.state.value)
      .then(() => {
        firebase.auth().currentUser.sendEmailVerification();
      })
      .catch(err => {
        console.log(err);
        this.setState({ error: err.code });
      });
  };

  handleForgottenPassword = () => {
    const { emailRef } = this;
    firebase
      .auth()
      .sendPasswordResetEmail(emailRef.current.state.value)
      .catch(err => {
        console.log(err);
        this.setState({ error: err.code });
      });
  };

  handleCta = action => {
    if (this.checkIsFormValid()) {
      this.setState({ error: undefined }, () => {
        action();
      });
    }
  };

  buildFields = () => {
    const { type: formType } = this.state;
    return this.forms[formType].fields.map(field => {
      const ref = React.createRef();
      this[`${field}Ref`] = ref;
      const { label, type, errorMessage, validator } = this.fields[field];
      return (
        <TextField
          key={field}
          label={label}
          type={type}
          errorMessage={errorMessage}
          validator={validator}
          ref={ref}
          onChange={this.onFieldChanged}
        />
      );
    });
  };

  goToForm = formType => this.setState({ type: formType, error: undefined }, this.checkIsFormValid);

  revalidate = () => {
    const { type } = this.state;
    const { fields } = this.forms[type];
    fields.forEach(field => {
      const ref = this[`${field}Ref`];
      ref.current.validate();
    });
  };

  checkIsFormValid = () => {
    const { type } = this.state;
    const { fields } = this.forms[type];

    const isFormValid = fields.every(field => {
      const ref = this[`${field}Ref`];
      return ref && ref.current.state.isValid;
    });

    this.setState({ isFormValid });
    return isFormValid;
  };

  onFieldChanged = () => {
    this.revalidate();
    setTimeout(this.checkIsFormValid);
  };

  render() {
    const { type, error } = this.state;
    const {
      cta: { action, label },
      subtext = [],
    } = this.forms[type];
    const { isFormValid } = this.state;
    const buttonClassNames = classNames('button button--primary', {
      'button--disabled': !isFormValid,
    });
    const errorClassNames = classNames('error-text', {
      'error-text--show': Boolean(error),
    });
    return (
      <div className="form__container">
        <div className="form">
          <img src={logo} className="form__logo" alt="logo" />
          <br />
          {this.buildFields()}
          <div className={errorClassNames}>{firebaseErros[error] || 'Something went wrong, please Try again.'}</div>
          <br />
          <div className={buttonClassNames} onClick={() => this.handleCta(action)}>
            {label}
          </div>
          <br />
          {subtext.map(({ action: linkAction, key, label: subtextLabel, link }) => (
            <Fragment key={key}>
              <div className="sub-text">
                {subtextLabel}{' '}
                <span className="link--light-bg" onClick={linkAction}>
                  {link}
                </span>
              </div>
              <br />
            </Fragment>
          ))}
        </div>
      </div>
    );
  }
}

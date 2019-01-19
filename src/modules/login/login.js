import React, { Component } from 'react';
import classNames from 'classnames';
import firebase from 'firebase/app';

import logo from '../../pokemon-battle-online-logo.png';
import { errors as firebaseErros } from '../../common/constants/firebase-errors';

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const SIGN_UP = 'sign-up';
const LOG_IN = 'log-in';

export class Login extends Component {
    fields = [
        { key: 'email', label: 'Email', type: 'email', validator: email => emailRegex.test(email), errorMessage: 'Invalid email format' },
        { key: 'password', label: 'Password', type: 'password', validator: password => password && 5 < password.length && password.length < 17, errorMessage: 'Password must be between 6 and 16 characters' },
        { key: 'confirmPassword', label: 'Confirm Password', type: 'password', validator: password => password === this.state.password.value, errorMessage: 'Passwords do not match' },
    ]

    state = {
        type: LOG_IN,
        focussed: undefined,
        error: undefined,
    }

    componentWillMount() {
        this.setState({ ...this.getInitialFormState(SIGN_UP) });
        window.addEventListener('keyup', this.handleKeyUp);
    }

    componentWillUnmount() {
        window.removeEventListener('keyup', this.handleKeyUp);
    }

    getFields = (type) => {
        return type === SIGN_UP ? this.fields : this.fields.filter(field => field.key === 'email' || field.key === 'password');
    }

    getInitialFormState (type) {
        return this.getFields(type).reduce((obj, field) => ({
            ...obj,
            [field.key]: {
                isAccessed: false,
                isValid: false,
                value: undefined,
            }
        }), {});
    }

    handleBlur = () => {
        this.setState({ focussed: undefined });
    }

    handleFocus = key => {
        const newFieldState = { ...this.state[key], isAccessed: true };
        this.setState({
            focussed: key,
            [key]: newFieldState,
        });
    }

    handleKeyUp = e => {
        if (e.key === 'Enter' && this.getIsFormValid()) {
            this.state.type === SIGN_UP ? this.handleSignUp() : this.handleLogIn();
        }
    }

    handleLogIn = () => {
        this.setState({ error: undefined }, () => {
            const { email, password } = this.state;
            firebase.auth().signInWithEmailAndPassword(email.value, password.value).catch(err => {
                console.log(err);
                this.setState({ error: err.code });
            });
        });
    }

    handleSignUp = () => {
        this.setState({ error: undefined }, () => {
            const { email, password } = this.state;
            firebase.auth().createUserWithEmailAndPassword(email.value, password.value).catch(err => {
                console.log(err);
                this.setState({ error: err.code });
            });
        });
    }

    buildFields = () => {
        return this.getFields(this.state.type).map(field => {
            const { key, label, type, errorMessage } = field;
            const { isAccessed, isValid, value } = this.state[key];
            const isFocussed = this.state.focussed === key;
            const classes = classNames('form__item', {
                'form__item--focussed': isFocussed,
                'form__item--errored': !isValid && !isFocussed && isAccessed,
                'form__item--shifted': isFocussed || !!value,
            });
            return (
                <div className={classes} key={key}>
                    <div className="form__label">
                        {label}
                    </div>
                    <input
                        type={type}
                        className={`form__input form__${type}`}
                        defaultValue={this.state[key] && this.state[key].value}
                        onChange={(e) => {
                            const text = e.target.value;
                            const newState = { ...this.state[key], value: text };
                            this.setState({ [key]: newState }, () => {
                                this.checkValidation();
                            });
                        }}
                        onFocus={() => this.handleFocus(key)}
                        onBlur={this.handleBlur}
                    />
                    <div className="form__error">{errorMessage}</div>
                    <br />
                </div>
            );
        });
    }

    goToLogIn = () => this.setState({ type: LOG_IN });
    
    goToSignUp = () => this.setState({ type: SIGN_UP });

    checkValidation = () => {
        this.getFields(this.state.type).forEach(field => {
            const { key, validator } = field;
            const { value } = this.state[key];
            const isValid = validator(value);
            const newFieldState = { ...this.state[key], isValid };
            this.setState({ [key]: newFieldState });
        });
    }

    getIsFormValid = () => {
        const keys = this.getFields(this.state.type).map(field => field.key);
        return keys.every(key => this.state[key] && this.state[key].isValid);
    }

    render() {
        const { type, error } = this.state;
        const isSignup = type === SIGN_UP;
        const isFormValid = this.getIsFormValid();
        const buttonClassNames = classNames('button button--primary', {
            'button--disabled': !isFormValid,
        });
        const errorClassNames = classNames('error-text', {
            'error-text--show': !!error,
        });
        return (
            <div className="form__container">
                <div className="form">
                    <img src={logo} className="form__logo" alt="logo" />
                    <br />
                    {this.buildFields()}
                    <div className={errorClassNames}>{firebaseErros[error] || 'Something went wrong, please Try again.'}</div>
                    <br />
                    <div
                        className={buttonClassNames}
                        onClick={() => {
                            if(isFormValid) {
                                isSignup ? this.handleSignUp() : this.handleLogIn();
                            }
                        }}
                    >
                        {isSignup ? 'Sign Up' : 'Log In'}
                    </div>
                    <br />
                    {isSignup ?
                        <div className="subtext--light-bg">
                            Already have an account?&nbsp;
                            <span className="link--light-bg" onClick={this.goToLogIn}>Log In</span>
                        </div>
                    : <div className="subtext--light-bg">
                        Don't have an account?&nbsp;
                        <span className="link--light-bg" onClick={this.goToSignUp}>Sign Up Free</span>
                    </div>}
                </div>
            </div>
        );
    }
};
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export class TextField extends Component {
  state = {
    isAccessed: false,
    isFocussed: false,
    isValid: false,
    value: '',
  };

  handleBlur = () => {
    this.setState({ isFocussed: false });
  };

  handleFocus = () => {
    this.setState({
      isFocussed: true,
      isAccessed: true,
    });
  };

  handleChange = e => {
    const text = e.target.value;
    this.setState({ value: text }, () => {
      const { onChange: customOnChange } = this.props;
      this.validate();
      customOnChange && customOnChange();
    });
  };

  validate = () => {
    const { validator } = this.props;
    const { value } = this.state;
    this.setState({ isValid: validator(value) });
  };

  render() {
    const { label, type, errorMessage } = this.props;
    const { isAccessed, isFocussed, isValid, value } = this.state;
    const classes = classNames('form__item', {
      'form__item--focussed': isFocussed,
      'form__item--errored': !isValid && !isFocussed && isAccessed,
      'form__item--shifted': isFocussed || Boolean(value),
    });
    return (
      <div className={classes}>
        <div className="form__label">{label}</div>
        <input
          type={type}
          className={`form__input form__${type}`}
          value={value}
          onChange={this.handleChange}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
        />
        <div className="form__error">{errorMessage}</div>
        <br />
      </div>
    );
  }
}

TextField.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
  validator: PropTypes.func.isRequired,
  onChange: PropTypes.func,
};

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export class Button extends Component {
  state = {
    mouseDown: false,
    mouseOver: false,
  };

  componentDidMount() {
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseDown = () => {
    this.setState({ mouseDown: true });
  };

  handleMouseUp = () => {
    this.setState({ mouseDown: false });
  };

  handleMouseEnter = () => {
    this.setState({ mouseOver: true });
  };

  handleMouseLeave = () => {
    this.setState({ mouseOver: false });
  };

  render() {
    const {
      className,
      label,
      onClick,
      disabled,
      style,
      colors: { outline, text, main },
    } = this.props;
    const { mouseDown, mouseOver } = this.state;
    const buttonClasses = classNames(`button button__outline--${outline} button__text--${text} button__main--${main}`, {
      'button--clicked': mouseDown && mouseOver,
      'button--disabled': disabled,
      [className]: className,
    });

    return (
      <div
        className={buttonClasses}
        style={style}
        onClick={onClick}
        onMouseDown={this.handleMouseDown}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {label}
      </div>
    );
  }
}

Button.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  style: PropTypes.object,
  colors: PropTypes.shape({
    outline: PropTypes.string,
    text: PropTypes.string,
    main: PropTypes.string,
  }),
};

Button.defaultProps = {
  colors: {
    outline: 'blue-mid',
    text: 'off-white',
    main: 'blue-mid',
  },
};

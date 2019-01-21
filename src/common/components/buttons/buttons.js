import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const PRIMARY = 'primary';
const SECONDARY = 'secondary';

class Button extends Component {
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
    const { className, type, label, onClick, disabled, style } = this.props;
    const { mouseDown, mouseOver } = this.state;
    const buttonClasses = classNames(`${className || ''} button button--${type}`, {
      'button--clicked': mouseDown && mouseOver,
      'button--disabled': disabled,
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
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  style: PropTypes.object,
};

export const PrimaryButton = props => <Button {...props} type={PRIMARY} />;

export const SecondaryButton = props => <Button {...props} type={SECONDARY} />;

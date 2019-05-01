import React, { Component } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase/app';

import { MEDIUM_URL } from '../../../common/constants/image-tools';
import { TextField } from '../../../common/components/form-fields/form-fields';
import { Button } from '../../../common/components/buttons/buttons';

const displayNameRegex = /^[a-zA-Z0-9 ]{3,16}$/;

export class DisplayNameModal extends Component {
  state = {
    value: '',
    errored: false,
  };

  usernameFieldRef = React.createRef();

  componentDidMount() {
    window.addEventListener('keyup', this.handleKeyUp);
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  setDisplayName = () => {
    const { isValid, value } = this.usernameFieldRef.current.state;
    if (isValid) {
      firebase
        .auth()
        .currentUser.updateProfile({
          displayName: value,
          photoURL: MEDIUM_URL.replace('{id}', '001'),
        })
        .then(() => {
          this.props.refreshUserProfile();
        })
        .catch(console.log);
    }
  };

  handleKeyUp = e => {
    if (e.key === 'Enter') {
      this.setDisplayName();
    }
  };

  validateDisplayName = value => {
    return displayNameRegex.test(value);
  };

  render() {
    return (
      <div className="readable">
        <div className="text--blue-mid size--1.2">Choose A Username</div>
        <div className="text--grey-mid size--0.9">(You can change this at any time)</div>
        <br />
        <TextField
          label="Username"
          type="text"
          errorMessage="Username must be between 3 and 16 characters with no special characters"
          validator={this.validateDisplayName}
          ref={this.usernameFieldRef}
        />
        <Button onClick={this.setDisplayName} label="Submit" />
      </div>
    );
  }
}

DisplayNameModal.propTypes = {
  refreshUserProfile: PropTypes.func.isRequired,
};

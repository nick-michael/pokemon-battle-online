import React, { Component } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase/app';

import { TextField } from '../../common/components/form-fields/form-fields';

const displayNameRegex = /^[a-zA-Z0-9 ]{3,16}$/;

class DisplayNameModal extends Component {
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
        .currentUser.updateProfile({ displayName: value })
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
        <div className="primary-text">Choose A Username</div>
        <div className="sub-text">(You can change this at any time)</div>
        <br />
        <TextField
          label="Username"
          type="text"
          errorMessage="Username must be between 3 and 16 characters with no special characters"
          validator={this.validateDisplayName}
          ref={this.usernameFieldRef}
        />
        <div className="button button--primary" onClick={this.setDisplayName}>
          Submit
        </div>
      </div>
    );
  }
}

DisplayNameModal.propTypes = {
  refreshUserProfile: PropTypes.func.isRequired,
};

export class Home extends Component {
  state = {
    userProfile: firebase.auth().currentUser || {},
  };

  refreshUserProfile = () => {
    this.setState({ userProfile: firebase.auth().currentUser });
  };

  render() {
    const {
      userProfile: { displayName },
    } = this.state;
    return (
      <div className="poke-container">
        {!displayName ? (
          <DisplayNameModal refreshUserProfile={this.refreshUserProfile} />
        ) : (
          <div
            className="button button--primary"
            style={{ position: 'absolute', right: '10px', top: '10px' }}
            onClick={() => firebase.auth().signOut()}
          >
            Log Out
          </div>
        )}
      </div>
    );
  }
}

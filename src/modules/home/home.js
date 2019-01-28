import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase/app';

import { TextField } from '../../common/components/form-fields/form-fields';
import { Button } from '../../common/components/buttons/buttons';
import { createLobby, joinLobby } from '../../common/utils/firebase';

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

export class Home extends Component {
  state = {
    userProfile: firebase.auth().currentUser || {},
  };

  refreshUserProfile = () => {
    this.setState({ userProfile: firebase.auth().currentUser });
  };

  handleCreateLobby = () => {
    createLobby()
      .then(({ data: { lobbyId } }) => {
        this.props.joinLobby(lobbyId);
      })
      .catch(console.log);
  };

  handleJoinLobby = () => {
    joinLobby('MlLFKYQhR6r8gA08xJlI')
      .then(({ data: { lobbyId } }) => {
        // this.props.joinLobby(lobbyId);
        this.props.joinLobby('MlLFKYQhR6r8gA08xJlI');
      })
      .catch(console.log);
  };

  render() {
    const {
      userProfile: { displayName },
    } = this.state;
    return (
      <Fragment>
        {!displayName ? (
          <DisplayNameModal refreshUserProfile={this.refreshUserProfile} />
        ) : (
          <Fragment>
            <Button
              style={{ position: 'absolute', right: '10px', top: '10px' }}
              onClick={() => firebase.auth().signOut()}
              label="Log Out"
            />
            <Button onClick={() => this.handleCreateLobby()} label="Create Lobby" />
            <Button onClick={() => this.handleJoinLobby()} label="Join Lobby" />
          </Fragment>
        )}
      </Fragment>
    );
  }
}

Home.propTypes = {
  goTo: PropTypes.func.isRequired,
  joinLobby: PropTypes.func.isRequired,
};

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase/app';

import logo from '../../pokemon-battle-online-logo.png';
import { createLobby, joinLobby } from '../../common/utils/firebase';

import { ProfileSummary } from './profile-summary/profile-summary';
import { DisplayNameModal } from './display-name-modal/display-name-modal';

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
    joinLobby('XygxObv8IEcDBgDAEPYv')
      .then(({ data: { lobbyId } }) => {
        // this.props.joinLobby(lobbyId);
        this.props.joinLobby('XygxObv8IEcDBgDAEPYv');
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
          <div className="home__container">
            <ProfileSummary
              profile={firebase.auth().currentUser}
              handleLogout={() => firebase.auth().signOut()}
            />
            <img src={logo} className="home__logo" alt="logo" draggable="false" />
            <div className="poke-ball__container">
              <div className="poke-ball__top" onClick={() => this.handleCreateLobby()}>
                <div className="poke-ball__label">
                  Create
                  <br />
                  Game
                </div>
              </div>
              <div className="poke-ball__bottom" onClick={() => this.handleJoinLobby()}>
                <div className="poke-ball__label">
                  Join
                  <br />
                  Game
                </div>
              </div>
              <div className="poke-ball__center">
              </div>
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}

Home.propTypes = {
  goTo: PropTypes.func.isRequired,
  joinLobby: PropTypes.func.isRequired,
};

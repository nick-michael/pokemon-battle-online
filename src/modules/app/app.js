import React, { Component } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase/app';
import 'firebase/auth';

import * as routes from '../../common/constants/routes';
import { Loading } from '../loading/loading';
import { Login } from '../login/login';
import { Home } from '../home/home';
import { PrimaryButton, SecondaryButton } from '../../common/components/buttons/buttons';

const Verify = ({ email, handleRefreshVerified }) => (
  <div className="poke-container">
    <div className="primary-text">Please verify your email address and refresh this page.</div>
    <br />
    <div className="sub-text">({email})</div>
    <br />
    <br />
    <div className="button__container">
      <PrimaryButton className="button button--primary" onClick={handleRefreshVerified} label="Refresh" />
      <SecondaryButton
        className="button button--primary"
        onClick={() => firebase.auth().currentUser.sendEmailVerification()}
        label="Re-Send Verification Email"
      />
      <PrimaryButton
        style={{ position: 'absolute', right: '10px', top: '10px' }}
        onClick={() => firebase.auth().signOut()}
        label="Log Out"
      />
    </div>
  </div>
);

Verify.propTypes = {
  email: PropTypes.string.isRequired,
  handleRefreshVerified: PropTypes.func.isRequired,
};

class App extends Component {
  state = {
    route: undefined,
    loading: true,
  };

  componentDidMount() {
    const config = {
      apiKey: 'AIzaSyBYyNMtROO9m2BdKwNLPiimRj2nxfA7-bo',
      authDomain: 'pokemon-battle-online.firebaseapp.com',
      databaseURL: 'https://pokemon-battle-online.firebaseio.com',
      projectId: 'pokemon-battle-online',
      storageBucket: 'pokemon-battle-online.appspot.com',
      messagingSenderId: '132443922906',
    };
    firebase.initializeApp(config);
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // firebase.auth().currentUser.delete();
        if (!user.emailVerified) {
          this.setState({ route: routes.VERIFY, loading: false });
        } else {
          this.setState({ route: routes.HOME, loading: false });
        }
      } else {
        this.setState({ route: routes.LOGIN, loading: false });
      }
    });
  }

  handleRefreshVerified = () => {
    firebase
      .auth()
      .currentUser.reload()
      .then(() => {
        if (firebase.auth().currentUser.emailVerified) {
          this.setState({ route: routes.HOME, loading: false });
        }
      })
      .catch(console.log);
  };

  getContent = () => {
    const { route } = this.state;
    switch (route) {
      case routes.HOME:
        return <Home />;
      case routes.LOGIN:
        return <Login />;
      case routes.VERIFY:
        return <Verify email={firebase.auth().currentUser.email} handleRefreshVerified={this.handleRefreshVerified} />;
      default:
        return <Loading />;
    }
  };

  render() {
    return (
      <div className="app">
        {this.state.loading && <Loading />}
        {this.getContent()}
      </div>
    );
  }
}

export default App;

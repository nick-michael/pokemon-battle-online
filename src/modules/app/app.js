import React, { Component } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase/app';
import 'firebase/auth';

import * as routes from '../../common/constants/routes';
import { Loading } from '../loading/loading';
import { Login } from '../login/login';
import { Home } from '../home/home';

const Verify = ({ email }) => (
  <div className="poke-container">
    <div className="primary-text">Please verify your email address and refresh this page.</div>
    <br />
    <div className="sub-text">({email})</div>
    <br />
    <br />
    <div className="button__container">
      <div className="button button--primary" onClick={() => firebase.auth().currentUser.sendEmailVerification()}>
        Re-Send Verification Email
      </div>
      <div
        className="button button--primary"
        style={{ position: 'absolute', right: '10px', top: '10px' }}
        onClick={() => firebase.auth().signOut()}
      >
        Log Out
      </div>
    </div>
  </div>
);

Verify.propTypes = {
  email: PropTypes.string.isRequired,
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

  getContent = () => {
    const { route } = this.state;
    switch (route) {
      case routes.HOME:
        return <Home />;
      case routes.LOGIN:
        return <Login />;
      case routes.VERIFY:
        return <Verify email={firebase.auth().currentUser.email} />;
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

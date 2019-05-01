import React, { Component } from 'react';
import firebase from 'firebase/app';
// import _throttle from 'lodash.throttle';
import 'firebase/auth';
import 'firebase/firestore';

import * as routes from '../../common/constants/routes';
import { VerifyEmail } from '../verify-email/verify-email';
import { Loading } from '../loading/loading';
import { Login } from '../login/login';
import { Home } from '../home/home';
import { Lobby } from '../lobby/lobby';

class App extends Component {
  state = {
    route: undefined,
    transition: false,
    lobbyId: undefined,
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
        console.log(firebase.auth().currentUser);
        // firebase.auth().currentUser.delete();
        if (!user.emailVerified) {
          this.goTo(routes.VERIFY);
        } else {
          this.goTo(routes.HOME);
        }
      } else {
        this.goTo(routes.LOGIN);
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

  goTo = route => {
    this.setState({ transition: true }, () => {
      setTimeout(() => this.setState({ route, transition: false }), 400);
    });
  };

  joinLobby = lobbyId => {
    this.setState({ lobbyId }, () => this.goTo(routes.LOBBY));
  };

  getContent = () => {
    const { route, lobbyId } = this.state;
    switch (route) {
      case routes.HOME:
        return <Home goTo={this.goTo} joinLobby={this.joinLobby} />;
        // return <Lobby lobbyId={'MlLFKYQhR6r8gA08xJlI'} />;
        // return <Login />;
        // return <SelectPartyPokemon />;
        // return <Loading />;
      case routes.LOGIN:
        return <Login />;
      case routes.LOBBY:
        return <Lobby lobbyId={lobbyId} />;
      case routes.VERIFY:
        return (
          <VerifyEmail email={firebase.auth().currentUser.email} handleRefreshVerified={this.handleRefreshVerified} />
        );
      default:
        return <Loading />;
    }
  };

  render() {
    return (
      <div className="app">
        <div className="poke-container">
          <div className={`swiper ${this.state.transition ? 'swiper--closed' : ''}`} />
          {this.getContent()}
        </div>
      </div>
    );
  }
}

export default App;

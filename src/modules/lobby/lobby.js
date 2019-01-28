import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase/app';
import _throttle from 'lodash.throttle';

import { startGame } from '../../common/utils/firebase';
import { Loading } from '../loading/loading';
import { Button } from '../../common/components/buttons/buttons';
import { gameDataInterface } from '../../common/constants/interfaces';

import { SelectPartyPokemon } from './select-party-pokemon/select-party-pokemon';
import { SelectBattlePokemon } from './select-battle-pokemon/select-battle-pokemon';

const Pregame = ({ gameData: { rules }, setLoading, lobbyId }) => {
  const handleStartGame = () => {
    setLoading(true, () => {
      startGame(lobbyId).catch(() => {
        setLoading(false);
      });
    });
  };

  return (
    <Fragment>
      <div className="rules">
        Game: {rules.game}
        Pokemon Party Size: {rules.numberOfPartyPokemon}
        Number Of Battle Pokemon: {rules.numberOfBattlePokemon}
      </div>
      <Button onClick={handleStartGame} label="Start Game" />
    </Fragment>
  );
};

Pregame.propTypes = {
  gameData: gameDataInterface,
  lobbyId: PropTypes.string.isRequired,
  setLoading: PropTypes.func.isRequired,
};

export class Lobby extends Component {
  state = {
    error: undefined,
    loading: true,
  };

  componentDidMount() {
    firebase
      .firestore()
      .collection('lobbies')
      .doc(this.props.lobbyId)
      .onSnapshot(snapshot => {
        const { state } = this.state;
        const newState = { ...snapshot.data() };
        if (newState.state !== state) {
          newState.loading = false;
        }
        this.setState(newState);
      });
  }

  setLoading = (isLoading, cb) => this.setState({ loading: isLoading }, cb);
  _setLoading = _throttle(this.setLoading, 400);

  getScreen = () => {
    const { state } = this.state;
    const { lobbyId } = this.props;
    switch (state) {
      case 'select_pokemon':
        return <SelectBattlePokemon gameData={this.state} setLoading={this._setLoading} lobbyId={lobbyId} />;
      case 'select_party':
        return <SelectPartyPokemon gameData={this.state} setLoading={this._setLoading} lobbyId={lobbyId} />;
      case 'pregame':
        return <Pregame gameData={this.state} setLoading={this._setLoading} lobbyId={lobbyId} />;
      default:
        return <Loading />;
    }
  };

  render() {
    const { loading = {} } = this.state;
    return (
      <Fragment>
        <div className={`swiper ${loading ? 'swiper--closed' : ''}`} />
        {this.getScreen()}
      </Fragment>
    );
  }
}

Lobby.propTypes = {
  lobbyId: PropTypes.string.isRequired,
};

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import firebase from 'firebase/app';
import shajs from 'sha.js';

import { pokemon as pokemonData } from '../../../data/stadium-2/stadium-2';
import { SelectedPlaceholder, SelectedPokemon, GridPokemon } from '../../../common/components/pokemon/pokemon';
import { gameDataInterface } from '../../../common/constants/interfaces';

export class SelectBattlePokemon extends Component {
  state = {
    battlePokemon: [],
  };

  battleSize = this.props.gameData.rules.numberOfBattlePokemon;

  buildBattlePokemon = () => {
    const { battlePokemon } = this.state;
    return (
      <div className="selected-pokemon selected-pokemon--vertical">
        {Array.from({ length: this.battleSize }).map((x, i) => {
          const pokemonId = battlePokemon[i];
          if (pokemonId) {
            const pokemon = pokemonData[pokemonId];
            console.log(pokemonId, pokemon);
            return <SelectedPokemon pokemon={pokemon} onRemove={this.removeBattlePokemon} key={pokemon.id} />;
          }
          return <SelectedPlaceholder key={i} />;
        })}
      </div>
    );
  };

  addBattlePokemon = id => {
    const { battlePokemon } = this.state;
    if (battlePokemon.length < this.battleSize && !battlePokemon.includes(id)) {
      this.setState({ battlePokemon: [...battlePokemon, id] });
    }
  };

  removeBattlePokemon = id => {
    const { battlePokemon } = this.state;
    this.setState({ battlePokemon: battlePokemon.filter(pokemonId => pokemonId !== id) });
  };

  buildParties = () => {
    const { battlePokemon } = this.state;
    const {
      gameData: { players },
    } = this.props;
    const huid = shajs('sha256')
      .update(firebase.auth().currentUser.uid)
      .digest('hex');
    const sortedPlayerIds = [huid, ...Object.keys(players).filter(playerHuid => playerHuid !== huid)];

    return sortedPlayerIds.map((playerId, i) => {
      const { displayName, party } = players[playerId];
      const isMyParty = playerId === huid;

      return (
        <div key={i} className={`battle-pokemon__party battle-pokemon__party--team-${i}`}>
          <div className="battle-pokemon__title">{isMyParty ? 'My Party' : displayName}</div>
          <div className="grid-pokemon">
            {party.map(pokemonId => {
              const pokemon = pokemonData[pokemonId];
              const { id } = pokemon;
              const pokemonClassNames = classNames('battle-grid__pokemon', {
                'battle-grid__pokemon--greyed': !isMyParty || battlePokemon.includes(id),
              });

              return (
                <GridPokemon
                  key={id}
                  onClick={() => isMyParty && this.addBattlePokemon(id)}
                  pokemon={pokemon}
                  className={pokemonClassNames}
                />
              );
            })}
          </div>
        </div>
      );
    });
  };

  render() {
    return (
      <div className="battle-pokemon__container">
        {this.buildBattlePokemon()}
        {this.buildParties()}
      </div>
    );
  }
}

SelectBattlePokemon.propTypes = {
  gameData: gameDataInterface,
  lobbyId: PropTypes.string.isRequired,
  setLoading: PropTypes.func.isRequired,
};

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { pokemon as pokemonData, moves as movesData } from '../../../data/stadium-2/stadium-2';
import { MEDIUM_URL } from '../../../common/constants/image-tools';
import { statsKeys } from '../../../common/constants/labels';
import { Button } from '../../../common/components/buttons/buttons';
import { SelectedPlaceholder, SelectedPokemon, GridPokemon } from '../../../common/components/pokemon/pokemon';
import { selectPartyPokemon } from '../../../common/utils/firebase';
import { pokemonInterface, gameDataInterface } from '../../../common/constants/interfaces';

const SORT_ID = 'id';
// const SORT_NAME = 'name';
// const SORT_TYPE = 'type';

const PokemonDetails = ({ pokemon, party, addPartyPokemon, partySize }) => {
  const { name, id, types, moves } = pokemon;

  const imageUrl = MEDIUM_URL.replace('{id}', id);
  return (
    <div className="party-pokemon__details">
      <div className="party-pokemon__details__col">
        <img className="party-pokemon__pokemon__image" src={imageUrl} alt={name} draggable="false" />
        <div className="party-pokemon__pokemon__name">{name}</div>
        {types.map(type => (
          <span key={type} className={`badge--${type}`} style={{ width: '80px', margin: '5px auto' }}>
            {type}
          </span>
        ))}
      </div>
      <div className="party-pokemon__details__col">
        {statsKeys.map(({ key, label }) => (
          <div className={`party-pokemon__details__stats text--${key}`} key={key}>
            {label}: {pokemon[key]}
          </div>
        ))}
      </div>
      <div className="party-pokemon__details__col">
        {moves.filter(move => Boolean(move)).map(key => {
          const move = movesData[key];
          const { type: moveType, name: moveName } = move;
          return (
            <div className={`party-pokemon__details__moves text--${moveType}`} key={key}>
              <span className={`badge--${moveType}`} style={{ width: '80px' }}>
                {moveType}
              </span>{' '}
              {moveName}
            </div>
          );
        })}
      </div>
      <div className="party-pokemon__details__col">
        <Button
          style={{ fontWeight: 'bold' }}
          type="text"
          label="Add To Party"
          disabled={party.includes(id) || party.length >= partySize}
          onClick={() => addPartyPokemon(id)}
        />
      </div>
    </div>
  );
};

PokemonDetails.propTypes = {
  pokemon: pokemonInterface.isRequired,
  party: PropTypes.arrayOf(PropTypes.string).isRequired,
  addPartyPokemon: PropTypes.func.isRequired,
  partySize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export class SelectPartyPokemon extends Component {
  state = {
    party: [],
    sort: SORT_ID,
    selectedPokemon: undefined,
  };

  partySize = this.props.gameData.rules.numberOfPartyPokemon;

  buildPartyPokemon = () => {
    const { party } = this.state;
    return (
      <div className="selected-pokemon">
        {Array.from({ length: this.partySize }).map((x, i) => {
          const pokemonId = party[i];
          if (pokemonId) {
            const pokemon = pokemonData[pokemonId];
            return <SelectedPokemon pokemon={pokemon} onRemove={this.removePartyPokemon} key={pokemon.id} />;
          }
          return <SelectedPlaceholder key={i} />;
        })}
      </div>
    );
  };

  addPartyPokemon = id => {
    const { party } = this.state;
    if (party.length < this.partySize && !party.includes(id)) {
      this.setState({ party: [...party, id], selectedPokemon: undefined });
    }
  };

  removePartyPokemon = id => {
    const { party } = this.state;
    this.setState({ party: party.filter(pokemonId => pokemonId !== id) });
  };

  clearRoster = () => {
    this.setState({ party: [] });
  };

  selectPokemon = id => {
    const { selectedPokemon } = this.state;
    if (selectedPokemon === id) {
      this.setState({ selectedPokemon: undefined });
    } else {
      this.setState({ selectedPokemon: id }, () => {
        document.getElementsByClassName('party-pokemon__details')[0].scrollIntoView({
          block: 'nearest',
        });
      });
    }
  };

  handleLockIn = () => {
    const { party } = this.state;
    const { lobbyId, setLoading } = this.props;
    if (party.length === this.partySize) {
      setLoading(true, () => {
        selectPartyPokemon(lobbyId, party).catch(() => {
          setLoading(false);
        });
      });
    }
  };

  render() {
    const { selectedPokemon, party } = this.state;
    const isPartyFull = party.length >= this.partySize;
    const confirmClassNames = classNames('party-pokemon__confirm', {
      'party-pokemon__confirm--active': isPartyFull,
    });

    return (
      <Fragment>
        {this.buildPartyPokemon()}
        <div className="grid-pokemon">
          {Object.values(pokemonData)
            .sort((a, b) => a.id - b.id)
            .map(pokemon => {
              const { id } = pokemon;
              const isSelectedPokemon = id === selectedPokemon;

              return (
                <Fragment key={id}>
                  <GridPokemon
                    onClick={() => this.selectPokemon(id)}
                    pokemon={pokemon}
                    className={isSelectedPokemon ? 'party-grid__pokemon--selected' : ''}
                  />
                  {isSelectedPokemon ? (
                    <PokemonDetails pokemon={pokemon} party={party} addPartyPokemon={this.addPartyPokemon} />
                  ) : (
                    undefined
                  )}
                </Fragment>
              );
            })}
        </div>
        <div className={confirmClassNames}>
          <div className="party-pokemon__confirm__button-container readable">
            <Button
              type="text"
              label="Clear Party"
              onClick={this.clearRoster}
              colors={{
                outline: 'off-white',
                main: 'blue-mid',
                text: 'off-white',
              }}
            />
            <Button
              type="text"
              label="Lock In"
              onClick={this.handleLockIn}
              colors={{
                outline: 'yellow-mid',
                main: 'yellow-mid',
                text: 'yellow-dark',
              }}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}

SelectPartyPokemon.propTypes = {
  gameData: gameDataInterface,
  lobbyId: PropTypes.string.isRequired,
  setLoading: PropTypes.func.isRequired,
};

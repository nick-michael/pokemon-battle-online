import React from 'react';
import PropTypes from 'prop-types';

import { MEDIUM_URL } from '../../constants/image-tools';
import { pokemonInterface } from '../../constants/interfaces';

export const SelectedPlaceholder = () => (
  <div className="selected-pokemon__pokemon">
    <div className="selected-pokemon__placeholder">
      <svg>
        <circle cx="50%" cy="50%" r="50px" />
      </svg>
    </div>
  </div>
);

export const SelectedPokemon = ({ className = '', pokemon, onRemove }) => (
  <div className={`selected-pokemon__pokemon ${className}`}>
    <div className="selected-pokemon__remove" onClick={() => onRemove(pokemon.id)}>
      x
    </div>
    <img
      className="selected-pokemon__image"
      src={MEDIUM_URL.replace('{id}', pokemon.id)}
      alt={pokemon.name}
      draggable="false"
    />
    <div className="selected-pokemon__name">{pokemon.name}</div>
  </div>
);

SelectedPokemon.propTypes = {
  className: PropTypes.string,
  pokemon: pokemonInterface.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export const GridPokemon = ({ className = '', pokemon, onClick }) => (
  <div className={`grid-pokemon__pokemon ${className}`} onClick={() => onClick(pokemon.id)}>
    <img
      className="grid-pokemon__image"
      src={MEDIUM_URL.replace('{id}', pokemon.id)}
      alt={pokemon.name}
      draggable="false"
    />
    <div className="grid-pokemon__name">{pokemon.name}</div>
  </div>
);

GridPokemon.propTypes = {
  className: PropTypes.string,
  pokemon: pokemonInterface.isRequired,
  onClick: PropTypes.func.isRequired,
};

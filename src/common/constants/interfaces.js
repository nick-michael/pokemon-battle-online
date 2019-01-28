import PropTypes from 'prop-types';

export const movesInterface = PropTypes.shape({
  name: PropTypes.string.isRequired,
  pp: PropTypes.string.isRequired,
  power: PropTypes.string.isRequired,
  accuracy: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
});

export const pokemonInterface = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  level: PropTypes.string.isRequired,
  hp: PropTypes.string.isRequired,
  attack: PropTypes.string.isRequired,
  defense: PropTypes.string.isRequired,
  'special-attack': PropTypes.string.isRequired,
  'special-defense': PropTypes.string.isRequired,
  speed: PropTypes.string.isRequired,
  moves: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, movesInterface])).isRequired,
  types: PropTypes.arrayOf(PropTypes.string).isRequired,
  gender: PropTypes.string.isRequired,
});

export const gameDataInterface = PropTypes.shape({
  ownerId: PropTypes.string.isRequired,
  ownerName: PropTypes.string.isRequired,
  players: PropTypes.object,
  rules: PropTypes.shape({
    game: PropTypes.oneOf(['stadium-2']),
    numberOfBattlePokemon: PropTypes.number,
    numberOfPartyPokemon: PropTypes.number,
    numberOfPlayers: PropTypes.number,
  }),
});

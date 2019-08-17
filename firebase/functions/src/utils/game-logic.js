/* TODO: Clauses
  Species clause: Each Pokémon on a player's team must be of different species or National Pokédex number.

  Item clause: Each Pokémon on a player's team must be holding different items.

  Self-KO clause: The player automatically loses if his last Pokémon uses Selfdestruct or Explosion. Destiny Bond and Perish Song also fail when used by the last Pokémon.

  Sleep clause: Each player can only have one Pokémon asleep at a time (Pokémon that are put to sleep due to Rest do not count).

  Freeze clause: Each player can only have one Pokémon frozen at a time.
*/

const getActivePokemon = (gameState, player) => (
  gameState.players
)

const processAction = (gameState, action) => {
  switch (action.type) {
    case 'SWAP': {
      const { players } = gameState;
      const actorModifiers = players[action.actor];
      const opponentModifiers = Object.values(players)
        .filter(player => )
      return [
        {
          ...gameState,
          players
        }
      ]
    }
  }
}
// Accept current state and action to apply
// Return new state and result of the action (e.g. attack missed, x was stunned e.t.c)

/*
action: {
  actor: {
    player: playerId,
    pokemon: pokemon,
  },
  type: ['SWAP', 'MOVE'],
  identifier: [{move-name}, {pokemon-name}]
  effects: [
    {

    }
  ]
}

move: {
  name: name,
  pp: pp,
  power: power,
  accuracy: accuracy,
  description: description,
  type: type,
  effects: [
    {
      type: ['ATTACK', 'MODIFIER']
    }
  ]
}

{
  effects: [ <effect> ],
  conditionals: [
    {

      turn: {
        took: {
          category: 'special'
        }
      },
      override: {
        damage: {
          key: 'turn.took.damage',
          scale: '2',
        }
      },
      self: {
        is: {
          type: ['ghost', 'poison'],
          gender: 'male',
        },
        not: {
          type: 'poison',
        }
      },
      opponent: {
        is: {
          type: 'fire'
        }
      },
      effects: [
        <effect>
      ]
    }
    {
      self: {
        not: {
          type: 'ghost',
        }
      },
      opponent: {
        type: 'fire'
      },
      effects: [
        <effect>
      ]
    }
  ],
  target: ['self-pokemon', 'self-player', 'opponent-pokemon', 'opponent-player', 'weather']
}

{
  type: 'MODIFIER',
  conditionals: [
    {
      self: {
        gender: 'male',
      },
      opponent: {
        gender: 'female'
      },
      effects: [
        <effect>
      ]
    },
    {
      self: {
        gender: 'female',
      },
      opponent: {
        gender: 'male'
      },
      effects: [
        <effect>
      ]
    },
  ],
  target: ['self-pokemon', 'self-player', 'opponent-pokemon', 'opponent-player', 'weather']
}
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
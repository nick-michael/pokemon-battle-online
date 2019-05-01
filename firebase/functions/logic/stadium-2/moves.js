const {
  moveCategory,
  moveResults,
  semiInvulnerableStates,
  weather,
  statusNonVolatile,
  statusVolatile,
} = require('../common/constants');

const { moves: movesData } = require('../../../data/stadium-2/stadium-2');
const attack = () => {};
const pX = (p) => Math.round(Math.random() * 100) <= p



/* event structure
// {
//   move: <move>,
//   result: HIT | MISSED | NO EFFECT,
//   message: String,
//   newState: <gameState>,
// }

{
  damage: 60,
  target: target_id,
  message: 'It hurt itelf in confusion!',
}

{
  target: target_id,
  message: 'It\'s defense was reduced',
}
*/

/* turn
[<event>]
*/

/* game state
{
  history: [<turn>]
  weather: <weather>,
  players: [<playerId>],
  <playerId>: {
    pokemon: [{
      id: String,
      name: String,
      level: Number,
      hp: Number,
      attack: Number,
      defense: Number,
      special-attack: Number,
      special-defense: Number,
      speed: Number,
      moves: [<move>],
      types: [<type>],
      gender: <gender>,
      active: Boolean,
      statuses: {
        volatile: [<volatileStatus>],
        nonVolatile: <nonVolatileStatus>,
      },
      stages: {
        <stage>: Number
      }
    }],
  },
}
*/

/*
  history: [<turn>]
  turn: [<move>]
  move: [<event>]
*/

/* moves structure
[
  {
    actor: <playerId>
    key: String,
  }
]
*/

const sortActions = (actions, currentGameState) => (
  actions.sort((a, b) => {
    const { speed: speedA } = currentGameState.players[a.actor].pokemon.find(p => p.active);
    const { speed: speedB } = currentGameState.players[b.actor].pokemon.find(p => p.active);
    return speedA - speedB;
  }).sort((a, b) => {
    return movesData[a.key].priority - movesData[b.key].priority
  })
);

const compute = (actions, currentGameState, currentHistory) => {
  const sortedActions = sortActions(actions, currentGameState);
  const newGameState = { ...currentGameState };
  const turn = sortedActions.reduce((action, arr) => {
    const 
    const { events: preActionEvents, shouldTerminate } = processPreAction(newGameState);

    if (shouldTerminate) {
      return [
        ...arr,
        preActionEvents,
      ];
    }

    const { events } = processAction(action, newGameState);
    const { events: postActionEvents } = processPostAction(newGameState);
    return [
      ...arr,
      [
        ...preActionEvents,
        ...events,
        ...postActionEvents,
      ],
    ];
  }, []);
  return {
    turn,
    gameState: newGameState,
  };
}

const processPreAction = (newGameState) => ({ events = [] });
const processPostAction = (newGameState) => ({ events = [] });

const processAction = (action, gameState) => {
  const events = action[move.key](move.actor, gameState);
  return { events };
}

const calculateDamage = (gameState, move, criticalHit) => {
  
};

exports.moves = {
  thunder: (actor, gameState, history) => {
    const moveStats = movesData['thunder']; 
    const opponent = gameState.players.find(id => id !== actor);
    const events = [{ focus: actor, message: `` }];
    if (gameState.weather === weather.HARSH_SUNLIGHT) {
      alteredMove.accuracy = move.accuracy * 0.5;
    } else if (gameState.weather === weather.RAIN) {
      alteredMove.accuracy = '1000';
    }
    const event = attack(actor, alteredMove, newState);
    events.push(event);
    if (event.result === moveResults.HIT && pX(30)) {
      events.push({
        message: 
      });
    }
  }
}
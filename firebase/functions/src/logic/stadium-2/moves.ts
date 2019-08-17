import {
  Pokemon as PokemonConstants,
  Moves as MovesConstants,
  GameState as GameStateConstants,
} from '../../../../constants/common';
import { typeEffectivenessObject } from '../../../../constants/type-effectiveness';

import { MoveData, PokemonData, specialMoveTypes } from '../../../../data/src/stadium-2/stadium-2';

const pX = (p: number) => Math.round(Math.random() * 100) <= p

type PlayerId = string;

type Turn = Array<GameEvent>;

type PlayerState = {
  id: string;
  displayName: string;
  party: Array<PokemonData>;
  pokemon: Array<PlayerPokemon>;
  substitute?: PlayerPokemon;
};

type StatusState<T extends GameStateConstants.StatusVolatile | GameStateConstants.StatusNonVolatile> = {
  status: T,
  turn: number,
  owner: { playerId: PlayerId, pokemonId: PlayerPokemon['id'] },
};

type PlayerPokemon = {
  id: string,
  name: string,
  level: number,
  hp: number,
  attack: number,
  defense: number,
  locked: {
    move: string,
    turn: number,
  },
  'special-attack': number,
  'special-defense': number,
  speed: number,
  moves: {
    [key: string]: MoveData
  },
  types: Array<PokemonConstants.Type>,
  gender: PokemonConstants.Gender,
  active: Boolean,
  semiInvulnerableState: GameStateConstants.SemiInvulnerableState,
  statuses: {
    volatile: Array<StatusState<GameStateConstants.StatusVolatile>>,
    nonVolatile: StatusState<GameStateConstants.StatusNonVolatile>,
  },
  stages: {
    [key in PokemonConstants.Stage]: number
  },
};

type GameState = {
  state: GameStateConstants.State;
  weather: {
    start: number,
    end: number,
    type: GameStateConstants.Weather;
  },
  players: {
    [key in PlayerId]: PlayerState;
  };
  turn: number;
  turns: Array<Turn>;
};

type GameEvent = {
  action: Action;
  result: MovesConstants.Result;
  messages: Array<string>;
  initialState: GameState,
  newState: GameState;
};

type Action = {
  actorId: PlayerId,
  type: GameStateConstants.ActionType,
  identifier: string; // move-key || pokemon-key
};

const sortActions = (actions: Array<Action>, currentGameState: GameState) => {
  const swapActions = actions.filter(a => a.type === GameStateConstants.ActionType.SWAP);
  const moveActions = actions
    .filter(a => a.type === GameStateConstants.ActionType.MOVE)
    .sort((a, b) => {
      const { speed: speedA, stages: stagesA } = currentGameState.players[a.actorId].pokemon.find(p => p.active) as PlayerPokemon;
      const { speed: speedB, stages: stagesB } = currentGameState.players[b.actorId].pokemon.find(p => p.active) as PlayerPokemon;
      const modifierA = getStageMultiplier(PokemonConstants.Stage.SPEED, stagesA[PokemonConstants.Stage.SPEED]);
      const modifierB = getStageMultiplier(PokemonConstants.Stage.SPEED, stagesB[PokemonConstants.Stage.SPEED]);
      return (speedA * modifierA) - (speedB * modifierB);
    }).sort((a, b) => {
      const { moves: movesA } = currentGameState.players[a.actorId].pokemon.find(p => p.active) as PlayerPokemon;
      const { moves: movesB } = currentGameState.players[b.actorId].pokemon.find(p => p.active) as PlayerPokemon;
      const priorityA = movesA[a.identifier].priority || 0;
      const priorityB = movesB[b.identifier].priority || 0;
      return priorityA - priorityB;
    });

  return [ ...swapActions, ...moveActions];
};

const compute = (actions: Array<Action>, currentGameState: GameState, turns: Array<Turn>) => {
  const sortedActions = sortActions(actions, currentGameState);
  const newGameState = { ...currentGameState };
  const turn = sortedActions.reduce((arr: Turn, action: Action) => {
    const events = processAction({ ...currentGameState }, newGameState, action, [...turns, arr]);
    const postActionEvents = processPostAction({ ...newGameState }, newGameState, [...turns, arr]);
    return [
      ...arr,
      ...events,
      ...postActionEvents,
    ];
  }, []);
  return {
    turn,
    gameState: newGameState,
  };
}

const processPostAction = (initialState: GameState, newGameState: GameState, turns: Array<Turn>): Array<GameEvent> => { return [] };

const processAction: MoveProcessor = (initialState, newGameState, action, turns) => {
  const { actorPokemon } = getStateComponents(action.actorId, newGameState);
  if (actorPokemon.locked)
  actorPokemon.moves[action.identifier].pp -= 1;
  const events = moves[action.identifier](initialState, newGameState, action, turns);
  return events;
}

const getActivePokemon = (playerState: PlayerState): PlayerPokemon => {
  return playerState.pokemon.find(p => p.active === true) as PlayerPokemon;
};

type StateComponents = {
  actorId: PlayerId,
  actor: PlayerState,
  actorPokemon: PlayerPokemon,
  targetId: PlayerId,
  target: PlayerState,
  targetPokemon: PlayerPokemon,
  targetSubstitute?: PlayerPokemon,
};
const getStateComponents = (actorId: PlayerId, gameState: GameState): StateComponents => {
  const targetId = Object.keys(gameState.players).find(i => i !== actorId) as PlayerId;

  const actor = gameState.players[actorId];
  const actorPokemon = getActivePokemon(actor);
  const target = gameState.players[targetId];
  const targetPokemon = getActivePokemon(target);
  const targetSubstitute = target.substitute;

  return {
    actorId,
    actor,
    actorPokemon,
    targetId,
    target,
    targetPokemon,
    targetSubstitute,
  };
};

const getAccuracyModifier = (actorPokemon: PlayerPokemon, targetPokemon: PlayerPokemon) => {
  const accuracyStageMultiplier = getStageMultiplier(PokemonConstants.Stage.ACCURACY, actorPokemon.stages[PokemonConstants.Stage.ACCURACY] || 0);
  const evasionStageMultiplier = getStageMultiplier(PokemonConstants.Stage.EVASION, targetPokemon.stages[PokemonConstants.Stage.EVASION] || 0);
  return accuracyStageMultiplier * evasionStageMultiplier;
};

const getCriticalHitProbability = (stage: number) => {
  switch (stage) {
    case 1:
      return 1/8;
    case 2:
      return 1/4;
    case 3:
      return 1/3;
  };
  if (stage > 3) {
    return 1/2;
  };
  return 1/16;
};

const getRandomModifier = () => {
  const min = 85;
  const max = 100;
  const rand = Math.floor(Math.random() * (max - min + 1)) + min;
  return rand / 100;
}

const getWeatherModifier = (weather: GameStateConstants.Weather, type: PokemonConstants.Type) => {
  if (weather === GameStateConstants.Weather.RAIN) {
    if (type === PokemonConstants.Type.WATER) {
      return 1.5;
    } else if (type === PokemonConstants.Type.FIRE) {
      return 0.5;
    }
  } else if (weather === GameStateConstants.Weather.HARSH_SUNLIGHT) {
    if (type === PokemonConstants.Type.WATER) {
      return 0.5;
    } else if (type === PokemonConstants.Type.FIRE) {
      return 1.5;
    }
  }
  return 1;
}

const getStabModifier = (moveType: PokemonConstants.Type, pokemon: PlayerPokemon) => {
  return pokemon.types.includes(moveType) ? 1.5 : 1;
};

const getTypeModifier = (moveType: PokemonConstants.Type, targetPokemon: PlayerPokemon) => {
  return targetPokemon.types.reduce((acc, cur) => ((typeEffectivenessObject[moveType][cur] || 1) * acc ), 1);
};

const getStageMultiplier = (stageType: PokemonConstants.Stage, stageValue: number): number => {
  let numerator = 2;
  let denominator = 2;
  if ([PokemonConstants.Stage.ACCURACY, PokemonConstants.Stage.EVASION].includes(stageType)) {
    numerator = 3;
    denominator = 3;
  }
  if (stageValue > 0) {
    numerator += stageValue;
  } else {
    denominator += Math.abs(stageValue);
  }
  return numerator / denominator;
}

const calculateDamage = (actorPokemon: PlayerPokemon, targetPokemon: PlayerPokemon, weather: GameStateConstants.Weather, moveData: MoveData) => {
  // https://bulbapedia.bulbagarden.net/wiki/Damage
  // https://bulbapedia.bulbagarden.net/wiki/Critical_hit
  const criticalHitStage = actorPokemon.stages[PokemonConstants.Stage.CRITICAL_HIT];
  const isCriticalHit = pX(getCriticalHitProbability(criticalHitStage));

  const { type: moveType, power: movePower } = moveData;
  const isSpecialMove = specialMoveTypes.includes(moveType);

  const levelModifier = ((2 * actorPokemon.level) / 5) + 2;

  let actorAttack: number;
  let targetDefense: number;

  if (isSpecialMove) {
    const attackStageModifier = getStageMultiplier(PokemonConstants.Stage.SPECIAL_ATTACK, actorPokemon.stages[PokemonConstants.Stage.SPECIAL_ATTACK]);
    const defenseStageModifier = getStageMultiplier(PokemonConstants.Stage.SPECIAL_DEFENSE, targetPokemon.stages[PokemonConstants.Stage.SPECIAL_DEFENSE]);
    actorAttack = actorPokemon['special-attack'] * attackStageModifier;
    targetDefense = targetPokemon['special-defense'] * defenseStageModifier;
  } else {
    const attackStageModifier = getStageMultiplier(PokemonConstants.Stage.ATTACK, actorPokemon.stages[PokemonConstants.Stage.ATTACK]);
    const defenseStageModifier = getStageMultiplier(PokemonConstants.Stage.DEFENSE, targetPokemon.stages[PokemonConstants.Stage.DEFENSE]);
    actorAttack = actorPokemon.attack * attackStageModifier;
    targetDefense = targetPokemon.defense * defenseStageModifier;
  }

  const attackDefenseModifier = isCriticalHit ? Math.max(actorAttack / targetDefense, 1) : actorAttack / targetDefense;
  const targetsModifier = 1;
  const weatherModifier = getWeatherModifier(weather, moveType);
  const critModifier = isCriticalHit ? 2 : 1;
  const randomModifier = getRandomModifier();
  const stabModifier = getStabModifier(moveType, actorPokemon);
  const typeModifier = getTypeModifier(moveType, targetPokemon);
  const damageWithoutModifiers = ((levelModifier * movePower * attackDefenseModifier) / 50) + 2;
  const finalDamage = damageWithoutModifiers * targetsModifier * weatherModifier * critModifier * randomModifier * stabModifier * typeModifier;
  return {
    damage: finalDamage,
    typeModifier,
    isCriticalHit,
  };
};

type Forwarder<T> = (t: T) => T; 
type AttackOverrides = {
  accuracy?: number | Forwarder<number>;
  critical?: boolean | Forwarder<boolean>;
  damage?: number | Forwarder<number>;
  typeModifier?: number | Forwarder<number>;
};

const attack = (initialGameState: GameState, gameState: GameState, action: Action, overrides: AttackOverrides = {}): GameEvent => {
  const { actorId } = action;
  const { actorPokemon, targetPokemon, targetSubstitute } = getStateComponents(actorId, gameState);
  const target = targetSubstitute || targetPokemon;
  const move = actorPokemon.moves[action.identifier];

  let accuracy = move.accuracy * getAccuracyModifier(actorPokemon, target);
  if (overrides.accuracy !== undefined) {
    accuracy = typeof overrides.accuracy === 'number' ? overrides.accuracy : overrides.accuracy(accuracy);
  }

  const didHit = pX(accuracy);
  if (!didHit) {
    return {
      action,
      result: MovesConstants.Result.MISSED,
      messages: ['The attack missed!'],
      initialState: initialGameState,
      newState: gameState,
    };
  }

  let { damage, typeModifier, isCriticalHit } = calculateDamage(actorPokemon, target, gameState.weather.type, move);
  if (overrides.damage !== undefined) {
    damage = typeof overrides.damage === 'number' ? overrides.damage : overrides.damage(damage);
  }
  if (overrides.critical !== undefined) {
    isCriticalHit = typeof overrides.critical === 'boolean' ? overrides.critical : overrides.critical(isCriticalHit);
  }
  if (overrides.typeModifier !== undefined) {
    typeModifier = typeof overrides.typeModifier === 'number' ? overrides.typeModifier : overrides.typeModifier(typeModifier);
  }
  const messages = [];
  if (typeModifier === 0) {
    return {
      action,
      result: MovesConstants.Result.NO_EFFECT,
      messages: ['It had no effect'],
      initialState: initialGameState,
      newState: gameState,
    };
  } else if (typeModifier === 0.5) {
    messages.push('It\'s not very effective...');
  } else if (typeModifier === 2) {
    messages.push('It\'s super effective!')
  }

  if (isCriticalHit) {
    messages.push('A critical hit!');
  }

  target.hp = Math.max(0, target.hp - damage);
  const result = target.hp === 0 ? MovesConstants.Result.KILLED : MovesConstants.Result.HIT;
  return {
    action,
    result,
    messages,
    initialState: initialGameState,
    newState: gameState,
  };
};

type MoveProcessor = (initialGameState: GameState, newGameState: GameState, action: Action, turns: Array<Turn>) => Array<GameEvent>;

export const moves: { [key: string]: MoveProcessor } = {
  thunder: (initialState, gameState, action): Array<GameEvent> => {
    const accuracyOverride = (accuracy: number) => {
      const accuracyOverrideExceptions = [GameStateConstants.SemiInvulnerableState.DIG, GameStateConstants.SemiInvulnerableState.DIVE];
      if (gameState.weather.type === GameStateConstants.Weather.HARSH_SUNLIGHT) {
        return accuracy * 0.5;
      } else if (
        gameState.weather.type === GameStateConstants.Weather.RAIN &&
        !accuracyOverrideExceptions.includes(targetPokemon.semiInvulnerableState)
      ) {
        return 1000;
      }
      return accuracy;
    };
    const attackEvent = attack(initialState, gameState, action, { accuracy: accuracyOverride });

    const { actorId } = action;
    const { targetPokemon, targetSubstitute } = getStateComponents(actorId, gameState);

    if(!targetSubstitute && attackEvent.result !== MovesConstants.Result.KILLED && pX(30)) {
      attackEvent.messages.push(`${targetPokemon.name} is paralyzed, maybe it can\'t attack!`);
    }

    return [attackEvent];
  },
  selfdestruct: (initialState, gameState, action) => {
    const { actorId } = action;
    const { actorPokemon } = getStateComponents(actorId, gameState);
    actorPokemon.hp = 0;

    return [attack(initialState, gameState, action)];
  },
  'mirror-coat': (initialState, gameState, action, turns) => {
    const currentTurn = turns[turns.length - 1];
    const { actorId } = action;
    const { actorPokemon, targetPokemon } = getStateComponents(actorId, gameState);

    const opponentAttack = currentTurn.find(t => t.result === MovesConstants.Result.HIT);
    if (!opponentAttack || !specialMoveTypes.includes(targetPokemon.moves[currentTurn[0].action.identifier].type)) {
      return [{
        action,
        initialState,
        newState: gameState,
        result: MovesConstants.Result.FAILED,
        messages: ['The move failed.'],
      }];
    }

    const opponentAttackDamage =
      (opponentAttack.newState.players[actorId].pokemon.find(p => p.id === actorPokemon.id) as PlayerPokemon).hp
      - (opponentAttack.initialState.players[actorId].pokemon.find(p => p.id === actorPokemon.id) as PlayerPokemon).hp;
    const isTargetDark = targetPokemon.types.includes(PokemonConstants.Type.DARK);
    return [attack(initialState, gameState, action, {
      damage: isTargetDark ? 0 : opponentAttackDamage * 2,
      typeModifier: isTargetDark ? 0 : 1,
      critical: false,
    })];
  },
  'rain-dance': (initialState, gameState, action, turns) => {
    gameState.weather = {
      start: gameState.turn,
      end: gameState.turn + 5,
      type: GameStateConstants.Weather.RAIN,
    };

    return [{
      action,
      newState: gameState,
      initialState,
      result: MovesConstants.Result.SUCCESS,
      messages: ['It\'s pouring down with rain!'],
    }];
  },
  swift: (initialState, gameState, action) => {
    return [attack(initialState, gameState, action)];
  },
  sonicboom: (initialState, gameState, action) => {
    const { targetPokemon, targetSubstitute } = getStateComponents(action.actorId, gameState);
    return [attack(initialState, gameState, action, {
      critical: false,
      typeModifier: () => {
        let modifier = 1;
        if (!targetSubstitute && targetPokemon.types.includes(PokemonConstants.Type.GHOST)) {
          modifier = 0;
        }
        return modifier;
      },
      damage: 20,
    })]
  },
  flash: (initialState, gameState, action) => {
    const { actorPokemon, targetPokemon, targetSubstitute } = getStateComponents(action.actorId, gameState);
    const accuracy = actorPokemon.moves[action.identifier].accuracy * getAccuracyModifier(actorPokemon, targetPokemon);
    const didHit = pX(accuracy);
    if (!didHit) {
      return [{
        action,
        result: MovesConstants.Result.MISSED,
        messages: ['The attack missed!'],
        initialState,
        newState: gameState,
      }];
    }

    if (targetSubstitute) {
      return [{
        action,
        result: MovesConstants.Result.FAILED,
        messages: ['The move failed.'],
        initialState,
        newState: gameState,
      }];
    }

    targetPokemon.stages.accuracy = (targetPokemon.stages.accuracy || 0) - 1;
    return [{
      action,
      result: MovesConstants.Result.SUCCESS,
      messages: [`${targetPokemon.name}'s accuracy was lowered.`],
      initialState,
      newState: gameState,
    }];
  },
  psychic: (initialState, gameState, action) => {
    const { targetPokemon, targetSubstitute } = getStateComponents(action.actorId, gameState);
    const attackEvent = attack(initialState, gameState, action);
    if (!targetSubstitute && attackEvent.result === MovesConstants.Result.HIT && pX(10)) {
      targetPokemon.stages['special-defense'] = (targetPokemon.stages['special-defense'] || 0) - 1;
      attackEvent.messages.push(`${targetPokemon.name}'s special defense was lowered.`)
    }
    return [attackEvent];
  },
  'giga-drain': (initialState, gameState, action) => {
    const attackEvent = attack(initialState, gameState, action);
    if (attackEvent.result === MovesConstants.Result.HIT) {
      const { targetPokemon: initialTargetPokemon, targetSubstitute: initialTargetSubstitute } = getStateComponents(action.actorId, initialState);
      const { actorPokemon, targetPokemon, targetSubstitute } = getStateComponents(action.actorId, initialState);
      const damageDealt = initialTargetSubstitute ?
        initialTargetSubstitute.hp - (targetSubstitute as PlayerPokemon).hp
        : initialTargetPokemon.hp - targetPokemon.hp;
      actorPokemon.hp += (damageDealt / 2);
    }
    return [attackEvent];
  },
  'stun-spore': (initialState, gameState, action) => {
    const { actorPokemon, targetPokemon, targetSubstitute } = getStateComponents(action.actorId, gameState);
    const accuracyModifier = getAccuracyModifier(actorPokemon, targetPokemon);
    const didHit = pX(actorPokemon.moves[action.identifier].accuracy * accuracyModifier);
    if (!didHit) {
      return [{
        action,
        result: MovesConstants.Result.MISSED,
        messages: ['The attack missed!'],
        initialState,
        newState: gameState,
      }];
    }

    if (targetSubstitute) {
      return [{
        action,
        result: MovesConstants.Result.FAILED,
        messages: ['The move failed.'],
        initialState,
        newState: gameState,
      }];
    }

    targetPokemon.statuses.nonVolatile.status = GameStateConstants.StatusNonVolatile.PARALYSIS;
    targetPokemon.statuses.nonVolatile.turn = gameState.turn;
    targetPokemon.statuses.nonVolatile.owner = { playerId: action.actorId, pokemonId: actorPokemon.id };
    return [{
      action,
      result: MovesConstants.Result.SUCCESS,
      messages: [`${targetPokemon.name} is paralyzed, maybe it can\'t attack!`],
      initialState,
      newState: gameState,
    }];
  },
  'leech-seed': (initialState, gameState, action) => {
    const { actorPokemon, targetPokemon, targetSubstitute } = getStateComponents(action.actorId, gameState);
    const accuracyModifier = getAccuracyModifier(actorPokemon, targetPokemon);
    const didHit = pX(actorPokemon.moves[action.identifier].accuracy * accuracyModifier);
    if (!didHit) {
      return [{
        action,
        result: MovesConstants.Result.MISSED,
        messages: ['The attack missed!'],
        initialState,
        newState: gameState,
      }];
    }

    if (targetSubstitute) {
      return [{
        action,
        result: MovesConstants.Result.FAILED,
        messages: ['The move failed.'],
        initialState,
        newState: gameState,
      }];
    }

    targetPokemon.statuses.volatile.push({
      status: GameStateConstants.StatusVolatile.LEECH_SEED,
      turn: gameState.turn,
      owner: { playerId: action.actorId, pokemonId: actorPokemon.id },
    });

    return [{
      action,
      result: MovesConstants.Result.SUCCESS,
      messages: [`${targetPokemon.name} was seeded!`],
      initialState,
      newState: gameState,
    }];
  },
  'egg-bomb': (initialState, gameState, action) => {
    return [attack(initialState, gameState, action)];
  },
  confusion: (initialState, gameState, action) => {
    const { actorPokemon, targetPokemon, targetSubstitute } = getStateComponents(action.actorId, gameState);
    const accuracyModifier = getAccuracyModifier(actorPokemon, targetPokemon);
    const didHit = pX(actorPokemon.moves[action.identifier].accuracy * accuracyModifier);
    if (!didHit) {
      return [{
        action,
        result: MovesConstants.Result.MISSED,
        messages: ['The attack missed!'],
        initialState,
        newState: gameState,
      }];
    }

    if (targetSubstitute) {
      return [{
        action,
        result: MovesConstants.Result.FAILED,
        messages: ['The move failed.'],
        initialState,
        newState: gameState,
      }];
    }

    targetPokemon.statuses.volatile.push({
      status: GameStateConstants.StatusVolatile.CONFUSION,
      turn: gameState.turn,
      owner: { playerId: action.actorId, pokemonId: targetPokemon.id },
    });

    return [{
      action,
      result: MovesConstants.Result.SUCCESS,
      messages: [`${targetPokemon.name} became confused!`],
      initialState,
      newState: gameState,
    }];
  },
  nightmare: (initialState, gameState, action) => {
    const { actorPokemon, targetPokemon, targetSubstitute } = getStateComponents(action.actorId, gameState);
    const accuracyModifier = getAccuracyModifier(actorPokemon, targetPokemon);
    const didHit = pX(actorPokemon.moves[action.identifier].accuracy * accuracyModifier);
    if (!didHit) {
      return [{
        action,
        result: MovesConstants.Result.MISSED,
        messages: ['The attack missed!'],
        initialState,
        newState: gameState,
      }];
    }

    if (targetSubstitute || targetPokemon.statuses.nonVolatile.status !== GameStateConstants.StatusNonVolatile.SLEEP) {
      return [{
        action,
        result: MovesConstants.Result.FAILED,
        messages: ['The move failed.'],
        initialState,
        newState: gameState,
      }];
    }

    targetPokemon.statuses.volatile.push({
      status: GameStateConstants.StatusVolatile.NIGHTMARE,
      turn: gameState.turn,
      owner: { playerId: action.actorId, pokemonId: targetPokemon.id },
    });

    return [{
      action,
      result: MovesConstants.Result.SUCCESS,
      messages: [`${targetPokemon.name} will have nightmares!`],
      initialState,
      newState: gameState,
    }];
  },
  'sleep-powder': (initialState, gameState, action) => {
    const { actorPokemon, targetPokemon, targetSubstitute } = getStateComponents(action.actorId, gameState);
    const accuracyModifier = getAccuracyModifier(actorPokemon, targetPokemon);
    const didHit = pX(actorPokemon.moves[action.identifier].accuracy * accuracyModifier);
    if (!didHit) {
      return [{
        action,
        result: MovesConstants.Result.MISSED,
        messages: ['The attack missed!'],
        initialState,
        newState: gameState,
      }];
    }

    if (targetSubstitute) {
      return [{
        action,
        result: MovesConstants.Result.FAILED,
        messages: ['The move failed.'],
        initialState,
        newState: gameState,
      }];
    }

    
    targetPokemon.statuses.nonVolatile.status = GameStateConstants.StatusNonVolatile.SLEEP;
    targetPokemon.statuses.nonVolatile.turn = gameState.turn;
    targetPokemon.statuses.nonVolatile.owner = { playerId: action.actorId, pokemonId: actorPokemon.id };

    return [{
      action,
      result: MovesConstants.Result.SUCCESS,
      messages: [`${targetPokemon.name} fell asleep!`],
      initialState,
      newState: gameState,
    }];
  },
  bonemerang: (initialState, gameState, action) => {
    const firstAttackEvent = attack(initialState, gameState, action);
    const events = [firstAttackEvent];
    if (firstAttackEvent.result !== MovesConstants.Result.KILLED) {
      events.push(attack(initialState, gameState, action));
    }

    return events;
  },
  headbutt: (initialState, gameState, action) => {
    const { actorPokemon, targetPokemon, targetSubstitute } = getStateComponents(action.actorId, gameState);
    const attackEvent = attack(initialState, gameState, action);
    if (attackEvent.result === MovesConstants.Result.HIT && !targetSubstitute && pX(100/3)) {
      targetPokemon.statuses.volatile.push({
        status: GameStateConstants.StatusVolatile.FLINCH,
        turn: gameState.turn,
        owner: { playerId: action.actorId, pokemonId: actorPokemon.id }
      });
    }
    return [attackEvent];
  },
  'icy-wind': (initialState, gameState, action) => {
    const { targetPokemon, targetSubstitute } = getStateComponents(action.actorId, gameState);
    const attackEvent = attack(initialState, gameState, action);
    if (attackEvent.result === MovesConstants.Result.HIT && !targetSubstitute) {
      targetPokemon.stages.speed -= 1;
      attackEvent.messages.push(`${targetPokemon} had it's speed reduced.`);
    }
    return [attackEvent];
  },
  'focus-energy': (initialState, gameState, action) => {
    const { actorPokemon } = getStateComponents(action.actorId, gameState);
    actorPokemon.stages['critical-hit'] += 1;
    return [{
      action,
      result: MovesConstants.Result.SUCCESS,
      messages: [`${actorPokemon.name} is getting pumped!`],
      initialState,
      newState: gameState,
    }];
  },
  'bone-rush': (initialState, gameState, action) => {
    const { actorPokemon } = getStateComponents(action.actorId, gameState);
    const events: Turn = [];
    const numberOfHits = Math.max(
      pX(62.5) ? 3 : 2,
      pX(25) ? 4 : 2,
      pX(12.5) ? 5 : 2,
    );

    for (let index = 0; index <= numberOfHits; index++) {
      if (events[events.length - 1] && events[events.length - 1].result === MovesConstants.Result.KILLED) {
        break;
      }
      events.push(attack(initialState, gameState, action));
    }
    return events;
  },
}
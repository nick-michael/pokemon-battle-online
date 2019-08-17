export namespace Pokemon {
  export const enum Type {
    NORMAL = 'normal',
    FIRE = 'fire',
    WATER = 'water',
    GRASS = 'grass',
    ELECTRIC = 'electric',
    ICE = 'ice',
    FIGHTING = 'fighting',
    POISON = 'poison',
    GROUND = 'ground',
    FLYING = 'flying',
    PSYCHIC = 'psychic',
    BUG = 'bug',
    ROCK = 'rock',
    GHOST = 'ghost',
    DRAGON = 'dragon',
    DARK = 'dark',
    STEEL = 'steel',
    FAIRY = 'fairy',
  };

  export const enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    NEUTRAL = 'neutral',
  };
  
  export const enum Stage {
    ATTACK = 'attack',
    DEFENSE = 'defense',
    SPECIAL_ATTACK = 'special-attack',
    SPECIAL_DEFENSE = 'special-defense',
    SPEED = 'speed',
    ACCURACY = 'accuracy',
    EVASION = 'evasion',
    CRITICAL_HIT = 'critical-hit',
  };
}

export namespace Moves {
  export enum Category {
    PHYSICAL = 'physical',
    SPECIAL = 'special',
  };

  export const enum Result {
    HIT = 'hit',
    KILLED = 'killed',
    MISSED = 'missed',
    NO_EFFECT = 'no-effect',
    FAILED = 'failed',
    SUCCESS = 'success',
  };
};

export namespace GameState {
  export const enum State {
    CHOOSE_ACTIONS = 'choose-actions',
    PROCESS_ACTIONS = 'process-actions',
    FAINT_CHOOSE_POKEMON = 'faint-choose-pokemon',
  };

  export const enum SemiInvulnerableState {
    BOUNCE = 'bounce',
    DIG = 'dig',
    DIVE = 'dive',
    FLY = 'fly',
    PHANTOM_FORCE = 'phantom-force',
    SHADOW_FORCE = 'shadow-force',
    SKY_DROP = 'sky-drop',
  };
  
  export const enum Weather {
    CLEAR = 'clear',
    HARSH_SUNLIGHT = 'harsh-sunlight',
    RAIN = 'rain',
    SANDSTORM = 'sandstorm',
    HAIL = 'hail',
    SHADOWY_AURA = 'shadowy-aura',
    FOG = 'fog',
  };
  
  // Status Conditions
  // Persist through swaps
  export const enum StatusNonVolatile {
    BURN = 'burn',
    FREEZE = 'freeze',
    PARALYSIS = 'paralysis',
    POISON = 'poison',
    BADLY_POISONED = 'badly-poisoned',
    SLEEP = 'sleep',
    FAINTED = 'fainted',
  };
  
  // Do not persist through swaps
  export const enum StatusVolatile {
    BOUND = 'bound',
    CANT_ESCAPE = 'cant-escape',
    CONFUSION = 'confusion',
    CURSE = 'curse',
    EMBARGO = 'embargo',
    ENCORE = 'encore',
    FLINCH = 'flinch',
    HEAL_BLOCK = 'heal-block',
    IDENTIFIED = 'identified',
    LEECH_SEED = 'leech-seed',
    NIGHTMARE = 'nightmare',
    PERISH_SONG = 'perish-song',
    TAUNT = 'taunt',
    TELEKINESIS = 'telekinesis',
    TORMENT = 'torment',
    // Unofficial locked state
    LOCKED = 'locked',
  };

  export const enum ActionType {
    SWAP = 'swap',
    MOVE = 'move',
  };
};

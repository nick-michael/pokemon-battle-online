exports.moveCategory = {
  PHYSICAL: 'physical',
  SPECIAL: 'special',
  STATUS: 'status',
};

exports.moveResults = {
  HIT: 'hit',
  MISSED: 'missed',
  NO_EFFECT: 'no-effect',
};

exports.semiInvulnerableStates = {
  BOUNCE: 'bounce',
  DIG: 'dig',
  DIVE: 'dive',
  FLY: 'fly',
  PHANTOM_FORCE: 'phantom-force',
  SHADOW_FORCE: 'shadow-force',
  SKY_DROP: 'sky-drop',
};

exports.weather = {
  CLEAR: 'clear',
  HARSH_SUNLIGHT: 'harsh-sunlight',
  RAIN: 'rain',
  SANDSTORM: 'sandstorm',
  HAIL: 'hail',
  SHADOWY_AURA: 'shadowy-aura',
  FOG: 'fog',
}

// Status Conditions
// Persist through swaps
exports.statusNonVolatile = {
  BURN: 'burn',
  FREEZE: 'freeze',
  PARALYSIS: 'paralysis',
  POISON: 'poison',
  BADLY_POISONED: 'badly-poisoned',
  SLEEP: 'sleep',
  FAINTED: 'fainted',
}

// Do not persist through swaps
exports.statusVolatile = {
  BOUND: 'bound',
  CANT_ESCAPE: 'cant-escape',
  CONFUSION: 'confusion',
  CURSE: 'curse',
  EMBARGO: 'embargo',
  ENCORE: 'encore',
  FLINCH: 'flinch',
  HEAL_BLOCK: 'heal-block',
  IDENTIFIED: 'identified',
  LEECH_SEED: 'leech-seed',
  NIGHTMARE: 'nightmare',
  PERISH_SONG: 'perish-song',
  TAUNT: 'taunt',
  TELEKINESIS: 'telekinesis',
  TORMENT: 'torment',
  // Unofficial locked state
  LOCKED: 'locked',
};

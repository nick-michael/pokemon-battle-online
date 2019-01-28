export const BASE_URL = 'https://assets.pokemon.com/assets/cms2/img/pokedex/{size}/{id}.png';

export const MEDIUM_URL = BASE_URL.replace('{size}', 'detail');
export const LARGE_URL = BASE_URL.replace('{size}', 'full');

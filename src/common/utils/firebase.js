import axios from 'axios';
import firebase from 'firebase/app';

const BASE_URL = 'http://localhost:5000/pokemon-battle-online/us-central1/v1/';

export const createLobby = password =>
  axios({
    method: 'POST',
    url: `${BASE_URL}createLobby`,
    data: {
      userId: firebase.auth().currentUser.uid,
      password,
    },
  });

export const joinLobby = (lobbyId, password) =>
  axios({
    method: 'POST',
    url: `${BASE_URL}joinLobby`,
    data: {
      userId: firebase.auth().currentUser.uid,
      lobbyId,
      password,
    },
  });

export const startGame = lobbyId =>
  axios({
    method: 'POST',
    url: `${BASE_URL}startGame`,
    data: {
      userId: firebase.auth().currentUser.uid,
      lobbyId,
    },
  });

export const selectPartyPokemon = (lobbyId, party) =>
  axios({
    method: 'POST',
    url: `${BASE_URL}selectPartyPokemon`,
    data: {
      userId: firebase.auth().currentUser.uid,
      lobbyId,
      party,
    },
  });

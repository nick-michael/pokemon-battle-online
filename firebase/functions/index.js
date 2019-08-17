const express = require('express');
const cors = require('cors');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const shajs = require('sha.js');

const errors = require('./errors');
const { getLobbyById, getUserById, updateLobby, doesLobbyHaveUser } = require('./utils/firestore');
const { gameStates } = require('./utils/states');

const app = express();
app.use(cors({ origin: '*', allowHeaders: 'Origin, X-Requested-With, Content-Type, Accept' }));

const wrap = fn => async (request, response) => {
  try {
    await fn(request, response);
  } catch (error) {
    const statusCode = error.code || 500;
    const payload = error.message || 'Internal Error';
    response.status(statusCode).send(payload);
  }
};

if (process.env.NODE_ENV === 'local') {
  const serviceAccount = require('../pokemon-battle-online-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://pokemon-battle-online.firebaseio.com',
  });
} else {
  admin.initializeApp();
}

const buildHash = string =>
  shajs('sha256')
    .update(string)
    .digest('hex');
const checkMissingParams = requiredArgs => {
  const missingArgs = Object.keys(requiredArgs).filter(key => requiredArgs[key] === undefined);
  if (missingArgs.length > 0) {
    const message = `Parameters Missing: ("${missingArgs.join('", "')}")`;
    throw { code: 400, message };
  }
};

// const { pokemon } = require('../../src/data/stadium-2/pokemon');
// const { moves } = require('../../src/data/stadium-2/moves');

// app.post('/exports', // async (request, response) => {
//   await admin.firestore().collection('data').doc('stadium-2').set({ pokemon });
//   await admin.firestore().collection('data').doc('stadium-2').set({ moves }, { merge: true });

//   response.send('OK');
// });

app.post(
  '/createLobby',
  wrap(async (request, response) => {
    const {
      body: { userId, password },
    } = request;
    checkMissingParams({ userId });

    const userRecord = await getUserById(userId);
    const { displayName, uid } = userRecord.toJSON();
    const huid = buildHash(uid);

    const lobby = {
      ownerId: huid,
      ownerName: displayName,
      players: {
        [huid]: {
          displayName,
          id: huid,
        },
      },
      rules: {
        game: 'stadium-2',
        numberOfPartyPokemon: 6,
        numberOfBattlePokemon: 3,
        numberOfPlayers: 2,
      },
      state: gameStates.PREGAME,
    };

    if (password) {
      lobby.password = password;
    }

    const ref = await admin
      .firestore()
      .collection('lobbies')
      .add(lobby);

    response.send({ lobbyId: ref.id });
  })
);

app.post(
  '/joinLobby',
  wrap(async (request, response) => {
    const {
      body: { userId, lobbyId, password },
    } = request;
    checkMissingParams({ userId, lobbyId });

    const lobby = await getLobbyById(lobbyId);
    const {
      players,
      rules: { numberOfPlayers },
      password: lobbyPassword,
    } = lobby;
    if (players.length >= numberOfPlayers) {
      throw errors.lobbyFull;
    }

    if (lobbyPassword && lobbyPassword !== password) {
      throw errors.incorrectPassword;
    }

    const userRecord = await getUserById(userId);
    const { displayName, uid } = userRecord.toJSON();
    const huid = buildHash(uid);

    await updateLobby(lobbyId, {
      players: {
        [huid]: {
          displayName,
          id: huid,
        },
      },
    });
    response.send('OK');
  })
);

app.post(
  '/startGame',
  wrap(async (request, response) => {
    const {
      body: { userId, lobbyId },
    } = request;
    checkMissingParams({ userId, lobbyId });

    const lobby = await getLobbyById(lobbyId);

    const {
      players,
      rules: { numberOfPlayers },
    } = lobby;

    if (Object.keys(players).length !== numberOfPlayers) {
      throw errors.numberOfPlayers;
    }

    const huid = buildHash(userId);
    doesLobbyHaveUser(lobby, huid);

    await updateLobby(lobbyId, {
      state: gameStates.SELECT_PARTY,
    });
    response.send('OK');
  })
);

app.post(
  '/selectPartyPokemon',
  wrap(async (request, response) => {
    const {
      body: { userId, lobbyId, party },
    } = request;
    checkMissingParams({ userId, lobbyId, party });

    const lobby = await getLobbyById(lobbyId);
    const huid = buildHash(userId);
    doesLobbyHaveUser(lobby, huid);

    const {
      rules: { game, numberOfPartyPokemon },
    } = lobby;
    const doc = await admin
      .firestore()
      .collection('data')
      .doc(game)
      .get();
    const { pokemon: allPokemon } = doc.data();

    const pokemonIds = Object.keys(allPokemon);

    const isAllPokemonValid = !party.some(pokemonId => !pokemonIds.includes(pokemonId));
    const isPartyValid = isAllPokemonValid && party.length === numberOfPartyPokemon;

    if (!isPartyValid) {
      throw errors.invalidParty;
    }

    const privateRef = admin
      .firestore()
      .collection('lobbies')
      .doc(lobbyId)
      .collection('private')
      .doc('private');
    await privateRef.set(
      {
        [huid]: {
          // id: huid,
          party,
        },
      },
      { merge: true }
    );

    const privateDoc = await privateRef.get();
    const privateData = privateDoc.data();

    const isAllPlayersLockedIn = !Object.keys(lobby.players).some(
      player => !(privateData[player] && privateData[player].party)
    );

    if (isAllPlayersLockedIn) {
      await updateLobby(lobbyId, {
        state: gameStates.SELECT_POKEMON,
        players: {
          ...privateData,
        },
      });
    }

    response.send('OK');
  })
);

app.post(
  '/selectBattlePokemon',
  wrap(async (request, response) => {
    const {
      body: { userId, lobbyId, battlePokemon },
    } = request;
    checkMissingParams({ userId, lobbyId, battlePokemon });

    const lobby = await getLobbyById(lobbyId);
    const huid = buildHash(userId);
    doesLobbyHaveUser(lobby, huid);

    const {
      rules: { game, numberOfBattlePokemon },
      players,
    } = lobby;
    const { party } = players[huid];

    const isSelectedPokemonInParty = !battlePokemon.some(pokemonId => !party.includes(pokemonId));
    const isSelectedPokemonValid = isSelectedPokemonInParty && battlePokemon.length === numberOfBattlePokemon;
    if (!isSelectedPokemonValid) {
      throw errors.invalidBattlePokemon;
    }

    const doc = await admin
      .firestore()
      .collection('data')
      .doc(game)
      .get();
    const { pokemon: allPokemon, moves: allMoves } = doc.data();

    const battlePokemonWithMoves = battlePokemon.reduce((acc, pokemonId) => {
      const pokemon = allPokemon[pokemonId];
      const moves = pokemon.moves.map(move => allMoves[move]);

      return acc.concat({
        ...pokemon,
        moves,
      });
    }, []);

    const privateRef = admin
      .firestore()
      .collection('lobbies')
      .doc(lobbyId)
      .collection('private')
      .doc('private');
    await privateRef.set(
      {
        [huid]: {
          // id: huid,
          pokemon: battlePokemonWithMoves,
        },
      },
      { merge: true }
    );

    const privateDoc = await privateRef.get();
    const privateData = privateDoc.data();

    const isAllPlayersLockedIn = !Object.values(privateData).some(player => !player.pokemon);
    if (isAllPlayersLockedIn) {
      startGame(lobbyId);
    }

    response.send('OK');
  })
);

const startGame = async lobbyId => {
  await admin
    .firestore()
    .collection('lobbies')
    .doc(lobbyId)
    .update({
      state: gameStates.CHOOSE_ACTIONS,
    });

  const unsubscribe = admin
    .firestore()
    .collection('lobbies')
    .doc(lobbyId)
    .onSnapshot(doc => {
      const data = doc.data();
      if (data.state === gameStates.SELECT_POKEMON) {
      } else if (data.state === gameStates.CHOOSE_ACTIONS) {
        const isAllPlayersActed = !data.players.some(player => !player.actions);
        if (isAllPlayersActed) {
          processActions(data);
        }
      } else if (data.state === gameStates.GAME_OVER) {
        unsubscribe();
        processEndGame(data);
      }
    });
};

const processActions = lobbyData => {
  
};

const processEndGame = lobbyData => {};

exports.v1 = functions.https.onRequest(app);

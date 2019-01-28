const admin = require('firebase-admin');

const errors = require('../errors');

exports.getUserById = uid => {
  return admin
    .auth()
    .getUser(uid)
    .catch(() => {
      throw errors.userNotFound;
    });
};

exports.getLobbyById = async lobbyId => {
  const doc = await admin
    .firestore()
    .collection('lobbies')
    .doc(lobbyId)
    .get();
  if (doc.exists) {
    return doc.data();
  } else {
    throw errors.lobbyNotFound;
  }
};

exports.updateLobby = (lobbyId, payload) => {
  return admin
    .firestore()
    .collection('lobbies')
    .doc(lobbyId)
    .set(payload, { merge: true })
    .catch(() => {
      throw errors.lobbyNotFound;
    });
};

exports.doesLobbyHaveUser = (lobby, huid) => {
  if (lobby.players[huid]) {
    return true;
  } else {
    throw errors.unauthorized;
  }
};

import React from 'react';
import firebase from 'firebase/app';

export const Home = ({ goTo }) => (
    <div className="poke-container">
        <div className="button button--primary" onClick={() => firebase.auth().signOut()}>Log Out</div>
    </div>
);
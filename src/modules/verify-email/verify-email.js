import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase/app';

import { Button } from '../../common/components/buttons/buttons';

export const VerifyEmail = ({ email, handleRefreshVerified }) => (
  <Fragment>
    <div className="text--blue-mid size--1.2">Please verify your email address and refresh this page.</div>
    <br />
    <div className="text--grey-mid size--0.9">({email})</div>
    <br />
    <br />
    <div className="button__container">
      <Button onClick={handleRefreshVerified} label="Refresh" />
      <Button
        onClick={() => firebase.auth().currentUser.sendEmailVerification()}
        label="Re-Send Verification Email"
        colors={{
          main: 'off-white',
          text: 'blue-mid',
        }}
      />
      <Button
        style={{ position: 'absolute', right: '10px', top: '10px' }}
        onClick={() => firebase.auth().signOut()}
        label="Log Out"
      />
    </div>
  </Fragment>
);

VerifyEmail.propTypes = {
  email: PropTypes.string.isRequired,
  handleRefreshVerified: PropTypes.func.isRequired,
};

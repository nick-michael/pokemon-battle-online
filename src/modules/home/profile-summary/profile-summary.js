import React, { Component } from 'react';
import classNames from 'classnames';

export class ProfileSummary extends Component {
  state = {
    hovered: false,
  }

  setHovered = () => {
    this.setState({ hovered: true });
  }

  unsetHovered = () => {
    this.setState({ hovered: false });
  }

  render() {
    const { profile, handleLogout } = this.props;
    const { hovered } = this.state;
    const containerClasses = classNames('profile__container', {
      'profile__container--extra': hovered,
    });

    return (
      <div className={containerClasses} onMouseEnter={this.setHovered} onMouseLeave={this.unsetHovered}>
        <div className="profile__details">
          <img className="profile__picture" src={profile.photoURL} alt="profile picture" />
          <div className="profile__name">{profile.displayName}</div>
        </div>
        <div className="profile__buttons">
          <div className="profile__logout" onClick={handleLogout} />
          <div className="profile__settings" onClick={handleLogout} />
        </div>
      </div>
    );
  }
};

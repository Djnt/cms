import React, { Component, Fragment } from "react";
import { withRouter } from "react-router";

class Header extends Component {

  logOut = () => {
    localStorage.removeItem('Token')
    localStorage.removeItem('User')
    this.props.history.push('/login')
  }

  render() {
    const user = localStorage.getItem('User')
    return (
      <div className='header'>
        {user && 
          <div className='right-block'>
            <button onClick={this.logOut}>Log Out</button>
            <div className='username'>{user}</div>
          </div>
        }
      </div>
    )
  }
}

export default withRouter(Header);

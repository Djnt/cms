import React, { Component, Fragment } from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";

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
        <div className='left-block'>
          {window.location.href.includes('client/') && 
            <Link to={`/clients`} className='invites-link'>Clients</Link>
          }
        </div>
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

import React, { Component } from "react";
import {api} from './Lib';
import {toast} from 'react-toastify';
import { withRouter } from "react-router";

class Login extends Component {
  state={
    email: '',
    password: ''
  }
  
  submit = () => {
    const { email, password } = this.state
    api.post('/logins', { email, password })
    .then(res => {
      console.log(res)
      localStorage.setItem('Token', res.data.token)
      localStorage.setItem('User', res.data.data.email)
      window.location.href = '/clients'
    })
    .catch(err => {
      toast.error('Invalid email or password', {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: false,
        hideProgressBar: true
      })
    })
  }
  
  render() {
    return (
      <div className='login col-12 col-md-2 offset-md-5'>
        <input type='text' placeholder='Email Address' value={this.state.email} onChange={e => this.setState({email: e.target.value})}/>
        <input type='password' placeholder='Password' value={this.state.password} onChange={e => this.setState({password: e.target.value})}/>
        <button onClick={this.submit}>Sign In</button>
      </div>
    );
  }
};
export default withRouter(Login);

import React, { Component, Fragment } from "react";
import {api} from './Lib.js';
import {toast} from 'react-toastify';
import { withRouter } from "react-router";
import { Link } from "react-router-dom";



class Client extends Component {
  state= {
    client: null,
    date: '',
    action: '',
    actions: []
  }

  componentDidMount() {
    console.log(this.props)
    api.get('/clients/' + this.props.match.params.id)
    .then(res => {
      this.setState({ client: res.data })
      console.log(res)
    })
    .catch(err => {
      console.log(err)
      if(err.response.status === 401)
        this.props.history.push("/login")
      else {
        toast.error('Unable to load client!', {
          position: toast.POSITION.BOTTOM_CENTER,
          autoClose: false,
          hideProgressBar: true
        })
      }
    })
  }

  renderClient = () => {
    const { client } = this.state
    return client && (
      <div className='history'>
        <div className='header-title'>
          <h4>Client: </h4>
          <h2>{client.name}</h2>
          <h4>Project:</h4>
          <h2>{client.project}</h2>
          <h4>Department: </h4>
          <h2>{client.department && client.department.name}</h2>
        </div>

        <div className='new-action-form'>
          <input type='date' placeholder='Date' value={this.state.date} onChange={e => this.setState({date: e.target.value})}></input>
          <textarea rows='1' placeholder='Action'value={this.state.action} onChange={e => this.setState({action: e.target.value})}></textarea>
          <button onClick={this.createAction}>Add</button>
        </div>
      </div>
      
    )
  }

  createAction = () => {
    if(!this.state.date || !this.state.action) {
      toast.error('Fields are missing!', {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: false,
        hideProgressBar: true
      })
      return
    }
    api.post('/actions', { date: this.state.date, title: this.state.action, client_id: this.state.client.id })
    .then(res => {
      let { actions } = this.state.client
      if(!actions || !actions.length)
        actions = [res.data]
      else actions = [res.data, ...actions]
      this.setState({ client: {...this.state.client, actions} })
    })
    .catch(err => {
      toast.error('Unable to create action!', {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: false,
        hideProgressBar: true
      })
    })
  }

  renderActions = () => {
    if(!this.state.client || !this.state.client.actions  || this.state.client.actions.length === 0)
      return null;
    
    return this.state.client.actions.map(a => {
      return <tr key={a.title}>
        <td>{a.date.split('T')[0]}</td>
        <td>{a.title.split(':')[0]}</td>
        <td style={{ textAlign: 'left', paddingLeft: '20px' }}>{a.title.split(':')[1]}</td>
      </tr>
    })
  }

  render() {
    return (
      <div className='actions col-12 col-md-8 offset-md-2'>
        {this.renderClient()}
        <table border='1px'>
          <thead>
            <tr>
              <td className='short'>Date</td>
              <td className='short'>Manager</td>
              <td>Action</td>
            </tr>
          </thead>
          <tbody>
            {this.renderActions()}
          </tbody>
        </table>
      </div>
    )
  }
}
export default withRouter(Client)
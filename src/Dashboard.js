import React, { Component, Fragment } from "react";
import {api} from './Lib.js';
import {toast} from 'react-toastify';
import { withRouter } from "react-router";
import { Link } from "react-router-dom";

const gamma = [
  'white',
  '#E5E5E5',
  '#DEACC3',
  '#F4AD9C',
  '#ACC7ED',
  '#E5FFF9',
  '#FFFFC3',
  '#CAF7AD'
]

class Dashboard extends Component {
  state= {
    clients: [],
    departments: [],
    newClientArgs: {},
    hasMore: false, 
    page: 0,
    palette: false,
    editing: {}
  }

  getClients = () => {
    api.get(`/clients?page=${this.state.page}`)
    .then(res => {
      this.setState({ clients: (this.state.page === 0 ? res.data : this.state.clients.concat(res.data)), hasMore: res.data.length === 10, page: this.state.page + 1 })
      console.log(res)
    })
    .catch(err => {
      console.log(err)
      if(err.response.status === 401)
        this.props.history.push("/login")
      else {
        toast.error('Unable to load clients!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: false,
          hideProgressBar: true
        })
      }
    })

  }

  componentDidMount() {
    this.getClients()
  
    api.get('/departments')
    .then(res => {
      this.setState({ departments: res.data.departments })
    })
    .catch(__err => {
    })
  }

  renderClients = () => {
    const { clients } = this.state
    return clients.map((client, index) => {
      const title = client.action ? client.action.title.split(': ')[1] : 'nothing yet'
      const editing = this.state.editing.id === client.id
      const data = this.state.editing
      return (
          <tr key={client.name + index} style={{backgroundColor: gamma[client.note]}}>
            <td>
              <div className={`side-controls-block ${editing && 'act' }`}>
                <i className="fa fa-paint-brush" onClick={() => this.setState({ palette: (this.state.palette !== client.id ? client.id : false) })}></i>
                {editing ? 
                  <Fragment>
                    <i className="fa fa-close" onClick={() => this.setState({ editing: {} })}></i>
                    <i className="fa fa-check" onClick={this.updateClient}></i>
                  </Fragment>
                  :
                  <i className="fa fa-edit" onClick={() => this.setState({ editing: client })}></i>
                }
                <i className="fa fa-trash" onClick={() =>this.destroyItem(client.id)}></i>
              </div>
            </td>
            <td>
              { editing ?
                <input className="form-control" type='text' value={data.name} onChange={e => this.applyEditValue(e.target.value, 'name')}></input>
                :
                client.name
              }
            </td>
            <td>
              { editing ?
                <input className="form-control" type='text' value={data.project} onChange={e => this.applyEditValue(e.target.value, 'project')}></input>
                :
                client.project
              }
            </td>
            <td>
              { editing ?
                <select className="form-control" placeholder='Department' onChange={e => this.applyEditValue(e.target.value, 'department_id')}>
                  <option value={-1}>None</option>
                  {this.state.departments.map(dep => {
                    return <option key={'dep' + dep.id} value={dep.id}>{dep.name}</option>
                  })}
                </select>
                :
                client.department && client.department.name
              }
            </td>
            <td>
              { editing ?
                <input className="form-control" type='text' value={data.estimate} onChange={e => this.applyEditValue(e.target.value, 'estimate')}></input>
                :
                client.estimate
              }
            </td>
            <td>
              { editing ?
                <input className="form-control" type='text' value={data.budget} onChange={e => this.applyEditValue(e.target.value, 'budget')}></input>
                :
                client.budget
              }
            </td>
            <td>
              { editing ?
                <input className="form-control" type='date' value={data.start_date} onChange={e => this.applyEditValue(e.target.value, 'start_date')}></input>
                :
                client.start_date
              }
            </td>
            <td>{client.action && <span style={{ fontWeight: '600' }}>{client.action.title.split(': ')[0] + ': '}</span>}<Link to={`/client/${client.id}`} className='invites-link'>{title}</Link></td>
          </tr>
      )
    })

  }

  applyEditValue = (val, key) => {
    this.setState({editing: {...this.state.editing, [key]: val}})
  }

  updateClient = () => {
    const { editing } = this.state
    const client = this.state.clients.find(c => c.id === editing.id)
    const args = {
      ...(editing.name && editing.name !== client.name && {name: editing.name}),
      ...(editing.project && editing.project !== client.project && {project: editing.project}),
      ...(editing.estimate && editing.estimate !== client.estimate && {estimate: editing.estimate}),
      ...(editing.budget && editing.budget !== client.budget && {budget: editing.budget}),
      ...(editing.start_date && editing.start_date !== client.start_date && {start_date: editing.start_date}),
      ...(editing.department_id && {department_id: editing.department_id}),
    }
    if(Object.keys(args).length === 0){
      this.setState({ editing: {} })
      return
    }
    api.put(`/clients/${editing.id}`, { client: args})
    .then(res => {
      let { clients } = this.state
      clients[clients.findIndex(c => c.id === res.data.id)] = res.data
      this.setState({ clients, editing: {} })
    })
    .catch(err => {
      toast.error('Unable to update client!', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: false,
        hideProgressBar: true
      })
    })
  }

  destroyItem = id => {
    api.delete(`/clients/${id}`)
    .then(res => {
      let { clients } = this.state
      this.setState({ page: 0, clients: clients.filter(i => i.id !== id) })
    })
    .catch(err => {
      toast.error('Unable to delete client!', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: false,
        hideProgressBar: true
      })
    })
  }

  createClient = () => {
    const { name, project, department_id } = this.state.newClientArgs
    if(!name || !project) {
      toast.error('Fields are missing!', {
        position: toast.POSITION.TOP_RIGHT
      })
    } else {
      let data = this.state.newClientArgs
      if(department_id)
        data.department_id = department_id
      if(department_id === -1)
        data.department_id = null
      
      api.post('/clients', { client: data })
      .then(res => {
        this.setState({ page: 0, clients: [res.data, ...this.state.clients] })
      })
      .catch(err => {
        toast.error('Unable to create client!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: false,
          hideProgressBar: true
        })
      })
    }
  }

  applyClientValue = (data, field) => {
    this.setState({newClientArgs: {...this.state.newClientArgs, [field]: data}})
  }

  addNewUserForm = () => {
    const { name, project, department_id, estimate, budget, start_date } = this.state.newClientArgs

    return (
      <div className='add-client-form form-row align-items-center'>
        <input type='text' className="form-control" placeholder='Name' value={name || ''} onChange={e => this.applyClientValue(e.target.value, 'name')} style={{ width: '15%' }}/>
        <input type='text' className="form-control" placeholder='Project' value={project || ''} onChange={e => this.applyClientValue(e.target.value, 'project')} style={{ width: '15%' }}/>
        <select className="form-control" placeholder='Department' onChange={e => this.applyClientValue(e.target.value, 'department_id')}>
          <option value={-1}>None</option>
          {this.state.departments.map(dep => {
            return <option key={'dep' + dep.id} value={dep.id}>{dep.name}</option>
          })}
        </select>
        <input className="form-control" type='number' placeholder='Est' value={estimate || ''} onChange={e => this.applyClientValue(e.target.value, 'estimate')}/>
        <input className="form-control" type='number' placeholder='Bdjt' value={budget || ''} onChange={e => this.applyClientValue(e.target.value, 'budget')}/>
        <input className="form-control" type='date' placeholder='Start Date' value={start_date || ''} onChange={e => this.applyClientValue(e.target.value, 'start_date')} style={{ width: '15%' }}/>
        <button disabled={!this.state.newClientArgs.name || !this.state.newClientArgs.project} type="button" className="btn btn-primary" onClick={this.createClient}>Create</button>
      </div>
    )
  }

  updateColor = index => {
    api.put(`/clients/${this.state.palette}`, { client: { note: index } })
    .then(res => {
      let { clients } = this.state
      clients[clients.findIndex(c => c.id === this.state.palette)].note = index
      this.setState({clients, palette: false})
    })
    .catch(err => {
      toast.error('Unable to cupdate colour!', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: false,
        hideProgressBar: true
      })
    })
  }

  renderPalette = () => {
    return (
      <div className='palette'>
        {gamma.map((c, index) => {
          return (
            <div className='opt' style={{ backgroundColor: c }} onClick={() => this.updateColor(index)}/>
          )
        })}
      </div>
    )
  }

  render() {
    return (
      <div className='dashboard col-12 col-md-8 offset-md-2'>
        {this.addNewUserForm()}
        {this.state.palette !== false && this.renderPalette()}
        <table border='1px' className='clients-table table table-hover table-bordered thead-dark'>
          <thead>
            <tr>
              <td></td>
              <td>Client</td>
              <td>Project</td>
              <td>Department</td>
              <td>Estimate (h)</td>
              <td>Budget ($)</td>
              <td>Start Date</td>
              <td>History</td>
            </tr>
          </thead>
          <tbody>{this.renderClients()}</tbody>
        </table>
        {/* {this.state.hasMore && <button className='load-more' onClick={this.getClients}></button>} */}
      </div>
    )
  }
}
export default withRouter(Dashboard)
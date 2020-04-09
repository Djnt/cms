import React, {Component} from 'react'
import {toast} from 'react-toastify';
import Loader from 'react-loader-spinner'
import {api} from '../../Lib'

export default class ReserveItemForm extends Component {
  state = {
    item: this.props.item,
    users: [],
    data: {},
    quantity: this.props.item.attributes.quantity,
    price: this.props.item.attributes['total-price'] || 0
  }

  componentDidMount() {
    api.get(`v1/users/contact_list?target_inventory_id=${this.props.item.id}`, {})
    .then(res => {
      console.log(res.data, 'CONTACTS')
      if(!res.data || !res.data.items || !res.data.items.length) {
        this.setState({users: [null]})
      } else {
        const users = res.data.items.map(relation => {
          const user = relation.user.id === this.props.current_user_id ? relation.friend : relation.user
          const price = (relation.user_relationship_prices.find(p => p.user_id === this.props.current_user_id) || {}).price
          return {
            name: relation.user.id === this.props.current_user_id && relation.friend_label ? relation.friend_label : (user.nickname || user.user_name),
            id: user.id,
            price: (Number(relation.proposed_price) || Number(price) || 0) + Number(this.state.item.attributes['total-price'])
          }
        }).filter(d => d.id !== this.props.current_user_id)
        this.setState({users, data: users[0], price: users[0].price})
      }
    })
    .catch(err => {
      toast.error('An error occured!', {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: true,
        hideProgressBar: true
      })
    })
  }

  updateData = id => {
    const user = this.state.users.find(u => u.id === Number(id))
    this.setState({data: user, price: user.price})
  }

  reserveItem = () => {
    let { data } = this.state
    console.log(this.state.quantity)
    api.post("/v1/items/requests/reserve", {inventory_id: this.state.item.id, user_id: data.id, quantity: this.state.quantity, price: this.state.price})
    .then(res => {
      toast.success('Item was successfully reserved!', {
        position: toast.POSITION.TOP_CENTER,
        hideProgressBar: true,
        autoClose: 2000
      })
      this.props.parent.getAllRequests(this.state.item.id)
      this.props.parent.setState({reserveItemForm: false})
      this.props.parent.getAllItemsReserved()
      this.props.parent.getAllItemsAvailable()
      this.props.parent.getMyItems()

    })
    .catch(err => {
      console.log(err.response)
      toast.error('Unable to reserve item!', {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: true,
        hideProgressBar: true
      })
    })

  }

  render () {
    let {item} = this.state
    return (
      <div className='blocker'>
      <div className="reserve-item-form">
        <img src='./cross.svg' alt='' className='close-button' onClick={this.props.close}/>
        <div onClick={(e)=>e.stopPropagation()}>
          <h3 className="align-center"> Reserve Item </h3>
          <div className="formField">
            <label>Quantity:</label> 
            <input id="request_quantity" type="number" defaultValue={this.state.quantity} onChange={e => this.setState({quantity: e.target.value})}/>
          </div>
          <div className="formField">
            <label>Price $:</label> 
            <input id="request_price" type="number" value={this.state.price} onChange={e => this.setState({price: e.target.value})}/>
          </div>
          {this.state.users.length > 0 ? 
            this.state.users[0] ? 
              <div className="formField">
                <label>User :</label>
                <select id="update_form_grade" defaultValue={this.state.data.id} onChange={e => this.updateData(e.target.value)} style={{width: '60%'}}>
                {this.state.users.map(user => {
                  return <option key={user.name} value={user.id}>{user.name}</option>
                })}
                </select>
              </div>
                :
              <h3>No users to reserve for</h3>
              :
            <Loader 
              type="Oval"
              color="black"
              height="50"	
              width="50"
            />     
          }
          <div className="formField align-center">
            <button className="submitButton" onClick={(e) => this.reserveItem()} style={{display: this.state.data.id ? 'block' : 'none'}}>
              Reserve Item
            </button>
          </div>
        </div>
      </div>
      </div>
    )
  }
}
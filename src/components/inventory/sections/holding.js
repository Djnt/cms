import React, { Component, Fragment } from 'react';
import {toast} from 'react-toastify';
import Loader from 'react-loader-spinner'
import { groupBy } from 'lodash'
import { checkPrice, api, getThumbUrl } from '../../../Lib';
import { sortOrdersByActionRequests as sortByActionRequests}  from './utils/sort'
import {FullScreenWindow} from '../../fullScreenWindow';

export default class HoldingItems extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: this.props.items,
      draggable: process.env.REACT_APP_DRAGGABLE.split(',').indexOf('Holding')!==-1 ? 'dragenabled' : '',
      offersWindow: false,
      offers: [],
      noteHidden: true,
      unwrapped: {},
      unwrappedItems: {},
      loading: false,
      listed: {}
    }
  }
  
  componentWillReceiveProps(p){
    if (p.items !== this.state.items)
      this.setState({items: p.items})

    setTimeout(() => this.setState({loading: false}), 500)
  }

  startLoading() {
    this.setState({loading: true})
  }

  renderOrder = item => {
    const userName = item.order['target-user-name'] || (item.items.find(i => i.attributes['target-user-name'] !== null) || {attributes: {}}).attributes['target-user-name']
    if(!userName) {
      return this.renderItems(item.items, true)
    }

    return (
      <div key={'holding-order' + item.order.id} className={`order-box  ${item.order.is_ready ? "active" : "pending"}`}>
        <li className='order-li' onClick={() => this.setState({unwrapped: {...this.state.unwrapped, [item.order.id]: this.state.unwrapped[item.order.id] ? false : true}})}>
          <div className="itemCard">
            <div className='left-block'>
              <div className='title'>{item.order.order_label}</div>
              <div className='count'>{item.items.length + ' items'}</div>
              <div className='target'>
                <div className='box'>{userName.charAt(0).toUpperCase()}</div>
                <div className='name'>{userName}</div>
              </div>
            </div>

            <div className='right-block'>
              <div className='controls'>
                <img alt='' src='./dots.svg' className='dots' onClick={() => this.props.parent.setState({updateOrderForm: item})}></img>
                {item.items.find(i => i.attributes['need_sign'] === true) && <img alt='' className="notification" src="./notification.svg"  title=""/>}
                {item.order.user_id !== this.props.current_user_id.toString() && item.order.is_ready && <img alt='' className='settle' src="./settle.svg"  title="" onClick={() => this.shipOrder(item.order.id)}/> }
                
              </div>
              <div className='price'>{`$${checkPrice(item.items.map(i => {return Number(i.attributes['total-price']) * parseFloat(i.attributes.quantity)}).reduce((sum, val) => sum + val))}`}</div>
              <div className='date'>{item.order.estimated_date ? new Date(item.order.estimated_date).toLocaleDateString('en-GB', {month : 'short', day : 'numeric'}) : ''}</div>
            </div>
          </div>
        </li>
        {this.state.unwrapped[item.order.id] && <div id={'requested-dropdown' + item.order.id}>
          {this.renderItems(item.items, false, item.order.id)}
        </div>}
      </div>
    )
  }


  renderList = items => {
    items = groupBy(items, i => i.attributes['target-user-name'])
    return Object.keys(items).map(k => {
      if (items[k].length === 1 || k === 'null') {
        return this.renderItems(items[k], true)
      }
      else {
        return (
          <div className={`user-group ${!this.state.listed[k] ? 'unwrapped-group' : ''}`} onClick={() => this.setState({listed: {...this.state.listed, [k]: this.state.listed[k] ? false : true}})}>
            <div className='group-title'>
              <span>{k}</span>
              <span style={{float: 'right', marginRight: '10px'}}>{'$' + checkPrice(items[k].map(i => {return Number(i.attributes['total-price']) * parseFloat(i.attributes.quantity)}).reduce((sum, val) => sum + val))}</span>
            </div>
            <div style={{display: (!this.state.listed[k] ? 'block' : 'none')}}>{this.renderItems(items[k], true)}</div>
            <div className='br'></div>
          </div>
        )
      }
    })
  }

  renderItems = (items, withoutOrder, orderId = null) => {
    const { parent } = this.props

    return items.map((item, index) => {
      let name = item.attributes.name
      let fullName = null
      if(name.length > 17) {
        fullName = name;
        name = name.slice(0, 15) + '..'
      }

      return (      
        <li key={'requested' + item.id + index} className={item.attributes['status']==="available"?"ui-state-highlight own":"ui-state-highlight"} onClick={e => e.stopPropagation()} >  
          <div className="itemCard">
            <img alt='' 
              className='preview' 
              src={item.attributes.avatars.length ? getThumbUrl(item.attributes.avatars[0]) : './preview.svg'}
              onMouseDown={(e)=>{parent.setState({requestItem: {...item, holding: true, type: this.props.items.dashboardType === 'producer' ? 'available' : null}});}} 
              onClick={(e)=>{parent.setState({requestViewForm: true, editItem: {...item, holding: true}, requestItems: null});parent.getAllRequests(item.id);}} 
            />
            <div className='main-stats'>
              <div 
                className='item-name'
                onMouseDown={(e)=>{parent.setState({requestItem: {...item, holding: true, type: this.props.items.dashboardType === 'producer' ? 'available' : null}});}} 
                onClick={(e)=>{parent.setState({requestViewForm: true, editItem: {...item, holding: true}, requestItems: null});parent.getAllRequests(item.id);}} 
              >
                {name}
                {fullName && <div aria-haspopup="true" className='item-name-full normal-name'>{fullName}</div>}
              </div>
              <div className='quantity'>
                {`${checkPrice(item.attributes.quantity)} ${item.attributes['unit-name']}`}
              </div>
              <div className='quantity bottom' style={{float: 'left', width: '100%'}}>
                {"$"+checkPrice(item.attributes['total-price']) + " ea."}
              </div>
            </div>

            <div className='main-controls'>
              {(item.attributes['need_sign'] || item.attributes['action-request']) &&
                <img alt='' className="bell" src="./notification.svg"  title=""/>
              }
            </div>
            <div className='side-stats'>
              <img alt='' 
                className="dots" 
                src="./dots.svg"
                onClick={() => {this.setState({menu: (this.state.menu === item.id ? null : item.id)})}} 
              />
              {this.state.menu === item.id && withoutOrder && <div className='cloud-menu cloud-menu-holding short'>
                <div onClick={() => {this.setState({menu: null}); this.props.parent.changeInventoryStatus(item.id, 'available')}}>To Available</div>
                <div onClick={() => {this.setState({menu: null}); this.props.parent.removeItem(item.id)}}>Remove</div>
                {withoutOrder && <div onClick={(e)=>{e.stopPropagation(); this.setState({offersWindow: item.id}); this.fetchOffers(item.id)}}>Add to order</div>}
              </div>}
              {this.state.menu === item.id && !withoutOrder && <div className='cloud-menu cloud-menu-holding'>
                {<div onClick={(e)=>{e.stopPropagation(); this.setState({removeFromOrderForm: {item: item.id, order: orderId}})}}>Remove from order</div>}
              </div>}
              <div className='price'>
                {"$"+checkPrice(item.attributes['total-price'] * item.attributes.quantity)}
                <img alt='' 
                  className={`drop-down ${this.state.unwrappedItems[item.id + 'i'] ? 'reverted' : ''}`} 
                  src='./downwrap.svg'
                  onClick={() => {
                    let unwrapped = this.state.unwrappedItems
                    unwrapped[item.id + 'i'] = !unwrapped[item.id + 'i']
                    this.setState({unwrappedItems: unwrapped})
                  }}
                />
              </div>
            </div>

            {this.state.unwrappedItems[item.id + 'i'] && <div className='additional-stats'>
              {withoutOrder && <div className='user-data'>
                {item.attributes['target-user-name'] && <div>
                  <div className='box'>
                    {item.attributes['target-user-name'].charAt(0).toUpperCase()}
                  </div>
                  <div className='user-name'>{item.attributes['target-user-name']}</div>
                </div>}    
              </div>}

              <div className='item-data' style={{float: (item.attributes['target-user-name'] && withoutOrder) ? 'left' : 'right'}}>
                {!item.attributes.organic && <img alt='' src="./organic.svg" title="organic" className='organic'/>}
                <div className='grade'>
                  {parent.state.grades && (parent.state.grades.length>0) && (parent.state.grades.find(function(grade){
                    return grade.id === item.attributes['grade-id']
                  }) || {}).name}
                </div>
              </div>
            </div>}
          </div>
        </li>
      )
    })
  }

  shipOrder = id => {
    api.patch(`/v1/orders/${id}`, {order_action: {action_name: 'ship'}})
    .then(res => {
      toast.success('Order was succesfuly shipped', {
        position: toast.POSITION.TOP_CENTER,
        hideProgressBar: true,
        autoClose: 2000
      })
      this.props.parent.getAllItemsReserved();
      this.props.parent.getAllItemsShipped();
    })
    .catch(err => {
      toast.error("Unable to ship order", {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: true,
        hideProgressBar: true
      })
    })
  }

  removeFromOffer = (itemId, orderId) => {
    api.patch(`/v1/orders/${orderId}`, {order_action: {action_name: 'remove_item', item_id: itemId}})
    .then(res => {
      toast.success('Item was succesfuly removed', {
        position: toast.POSITION.TOP_CENTER,
        hideProgressBar: true,
        autoClose: 2000
      })
      this.setState({offers: [], offersWindow: itemId, removeFromOrderForm: false}); 
      this.fetchOffers(itemId)
      this.props.parent.getAllItemsReserved();
      this.props.parent.getAllItemsShipped();
    })
    .catch(err => {
      toast.error("Unable to remove item", {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: true,
        hideProgressBar: true
      })
    })
  }

  addToOffer = (orderId) => {
    api.patch(`/v1/orders/${orderId}`, {order_action: {item_id: this.state.offersWindow, action_name: 'add_item'}})
    .then(res => {
      this.setState({offersWindow: null})
      this.props.parent.getAllItemsReserved()
    })
    .catch(err => {
      toast.error("Unable to add item to this offer", {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: true,
        hideProgressBar: true
      })
    })
  }

  fetchOffers = (id) => {
    api.post(`/v1/orders/`, {order: {acceptable_item: id}})
    .then(res => {
      if(res.data.orders.length)
        this.setState({offers: res.data.orders})
      else this.setState({offers: null})
    })
  }

  createOrder = () => {
    const order_label = document.getElementById('order_label').value
    const estimated_date = document.getElementById('estimated_date').value
    const estimated_time = document.getElementById('estimated_time').value
    const location = document.getElementById('location').value
    const note = (document.getElementById('note') || {}).value || ''

    let order = {
      estimated_date: estimated_date,
      order_label: order_label,
      friend_id: this.props.current_user_id,
      user_id: this.state.offersWindow,
      estimated_time,
      location,
      note
    }

    api.post(`/v1/orders/`, {order})
    .then(res => {
      let { offers } = this.state
      if(offers === null) offers = []
      offers.push(res.data.order)
      this.setState({offers})
    })
    .catch(err => {
      toast.error(err.response.data.error, {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: true,
        hideProgressBar: true
      })
    })
  }

  offersWindow = () => {
    let {offers} = this.state
    return (
      <FullScreenWindow close={() => this.setState({offersWindow: false})}>
      <div className="update-order-form">
        <div onClick={(e)=>e.stopPropagation()}>
          <h3 className="align-center"> {"Orders list"} </h3>
          {offers && offers.length === 0 && <Loader 
            type="Oval"
            color="black"
            height="50"	
            width="50"
          /> }
          {offers && offers.length > 0 && <div className='orders-list'> {offers.map(offer => {
            return (
              <div key={offer.id + 'list'} className='order-selectable' onClick={() => this.addToOffer(offer.id)}>
                {offer.order_label}
              </div>
            )
          })} </div>}
          <div className="formField">
            <label>order label</label> 
            <input id="order_label" type="text"/>
          </div>
          <div className="formField">
            <label>estimated date</label> 
            <input id="estimated_date" type="date" />
          </div>
          <div className="formField">
            <label>estimated time</label> 
            <input id="estimated_time" type="time"/>
          </div>
          <div className="formField">
            <label>location</label> 
            <select id="location"
              defaultValue='pick up'
              onChange={e => {this.setState({noteHidden: e.target.value !== 'other'})}}
            >
              <option>pick up</option>
              <option>delivery</option>
              <option>other</option>
            </select>
          </div>
          {!this.state.noteHidden && <div className="formField">
            <textarea id="note" type="text" 
              cols="40" 
              rows="5" 
              defaultValue=''
              style={{width: '90%'}}
            />
          </div>}

          <div className="formField mt-15 align-center">
            <button className="submitButton" onClick={() => this.createOrder()}>
              Create Order
            </button>
          </div>
        </div>
      </div>
      </FullScreenWindow>
    )
  }

  cancelRequest = (item, toAvailable = false) => {
    api.get(`/v1/items/${item}/requests`)
    .then(res => {
      if(Object.keys(res.data).length > 0 || Object.keys(res.data[Object.keys(res.data)[0]]).length > 0) {
        let id = Object.keys(res.data[Object.keys(res.data)[0]])[0]
        this.props.parent.cancelRequest(id)
        if(toAvailable)
          setTimeout(() => this.props.parent.changeInventoryStatus(item, 'available'), 500)
        this.setState({removeFromOrderForm: false})
      } else 
      toast.error("There was an error while looking for requests", {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: true,
        hideProgressBar: true
      })
    })
    .catch(err => {
      toast.error(err.response.data.error, {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: true,
        hideProgressBar: true
      })
    })
  }

  dialogueWindow = () => {
    const {item, order} = this.state.removeFromOrderForm
    return (
      <FullScreenWindow close={() => this.setState({removeFromOrderForm: false})}>
        <div className="updateOrderForm" onClick={() => this.setState({removeFromOrderForm: false})}>
          <h3 className="align-center"> Choose next action </h3>
          <div style={{width: '100%'}}><button onClick={()=>{this.removeFromOffer(item, order);}}>Move to another order</button></div>
          <div style={{width: '100%'}}><button onClick={()=>{this.cancelRequest(item, true);}}>Cancel request and Move to Available</button></div>  
        </div>
      </FullScreenWindow>
    )

  }

  assignMenus = (e) => {
    document.documentElement.style.setProperty('--scr-h', `${-e.target.scrollTop}px`);
    return true;
  }

  render() {
    const { items } = this.state
    const { dashboardType, broker, producer } = items;
    let list = sortByActionRequests(dashboardType === 'broker' ? broker : producer);

    let totalCount = 0
    if(list.listItems.map){
      // eslint-disable-next-line array-callback-return
      list.listItems.map(i => {
        let itms;
        if(i.map)
          itms =  i 
        else itms = i.items

        // eslint-disable-next-line array-callback-return
        itms.map(itm => {
          totalCount += parseFloat(itm.attributes.quantity)
        })
      })
    }

    if (list.listItems.length === 0 && dashboardType === "producer")
      return null
    return (
      <Fragment>
      <div className="column" style={{width: this.props.isListWidthAuto? 'calc(25% - 8px)': this.props.listFixedWidth}}>
      <img alt='' src='./refresh.svg' className={`refresh-button ${this.state.loading ? 'loading' : ''}`} onClick={() => {this.startLoading(); this.props.parent.getAllItemsReserved()}}></img>
        <div className="box">
          <div className="header">
            <div className='title'>{list.listName}</div>
            <div className='stats'>{totalCount + ' units'}</div>
          </div>

          <div className="body" onScroll={e => this.assignMenus(e)}>
            <ul className={"droptrue sortable " + this.state.draggable}>
              {list.listItems.map && !this.state.loading && list.listItems.map(item => {
                return item.map ? this.renderList(item, true) : this.renderOrder(item)
              })}
            </ul>
          </div>
        </div>
      </div>
      {this.state.offersWindow && this.offersWindow()}
      {this.state.removeFromOrderForm && this.dialogueWindow()}
      </Fragment>
    )
  }
}
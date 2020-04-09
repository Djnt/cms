import React, { Component, Fragment } from 'react';
import {toast} from 'react-toastify';
import { checkPrice, api, getThumbUrl } from '../../../Lib';
import { sortOrdersByActionRequests as sortByActionRequests}  from './utils/sort'

export default class ShippedItems extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: this.props.items,
      draggable: process.env.REACT_APP_DRAGGABLE.split(',').indexOf('Shipped')!==-1 ? 'dragenabled' : '',
      unwrapped: {},
      loading: false,
      unwrappedItems: {}
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

  removeOrder = id => {
    api.delete(`/v1/orders/${id}`)
    .then(res => {
      toast.success('Order was succesfuly destroyed', {
        position: toast.POSITION.TOP_CENTER,
        hideProgressBar: true,
        autoClose: 2000
      })
      this.props.parent.getAllItemsShipped();
    })
    .catch(err => {
      toast.error("Unable to destroy order", {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: true,
        hideProgressBar: true
      })
    })
  }

  renderItems = (items, inOrder = false) => {
    const { parent } = this.props

    return items.map((item, index) => {
      let name = item.attributes.name
      let fullName = null
      if(name.length > 16) {
        fullName = name;
        name = name.slice(0, 14) + '..'
      }
      return (
        <li key={'requested' + item.id + index} className={item.attributes['status']==="available"?"ui-state-highlight own":"ui-state-highlight"}>  
        <div className="itemCard full-stats">
          <img alt='' 
            className='preview' 
            src={item.attributes.avatars.length ? getThumbUrl(item.attributes.avatars[0]) : './preview.svg'}
            onMouseDown={(e)=>{parent.setState({requestItem: {...item, type: this.props.items.dashboardType === 'producer' ? 'available' : null}});}} 
            onClick={(e)=>{parent.setState({requestViewForm: true, editItem: item, requestItems: null});parent.getAllRequests(item.id, true);}} 
          />
          <div className='main-stats'>
            <div 
              className='item-name'
              onMouseDown={(e)=>{parent.setState({requestItem: {...item, type: this.props.items.dashboardType === 'producer' ? 'available' : null}});}} 
              onClick={(e)=>{parent.setState({requestViewForm: true, editItem: item, requestItems: null});parent.getAllRequests(item.id, true);}}
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

          <div className='side-stats'>
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
            {!inOrder && <div className='user-data'>
              <div className='box'>
                {item.attributes['target-user-name'].charAt(0).toUpperCase()}
              </div>
              <div className='user-name'>{item.attributes['target-user-name']}</div>
            </div>}

            <div className='item-data' style={{float: (item.attributes['target-user-name'] && !inOrder) ? 'left' : 'right'}}>
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

  renderOrder = item => {
    const isNotSigned = item.items.find(i => i.attributes.signed !== true)

    return (
      <div key={'shipped-order' + item.order.id} className={"order-box " + (isNotSigned ? "pending" : "active")}>
        <li className='order-li' onClick={() => this.setState({unwrapped: {...this.state.unwrapped, [item.order.id]: this.state.unwrapped[item.order.id] ? false : true}})}>
          <div className="itemCard">
            <div className='left-block'>
              <div className='title'>{item.order.order_label}</div>
              <div className='count'>{item.items.length + ' items'}</div>
              <div className='target'>
                <div className='box'>{item.items[0].attributes['target-user-name'].charAt(0).toUpperCase()}</div>
                <div className='name'>{item.items[0].attributes['target-user-name']}</div>
              </div>
            </div>

            <div className='right-block'>
              <div className='controls'>
                {isNotSigned ? <img alt='' className='waiting' src="./waitsign.png"/> : <img alt='' className='remove' src="./close.png" onClick={() => this.removeOrder(item.order.id)}/>}
                <img alt='' src='./dots.svg' className='dots'></img>
              </div>
              <div className='price'>{`$${checkPrice(item.items.map(i => {return Number(i.attributes['total-price']) * parseFloat(i.attributes.quantity)}).reduce((sum, val) => sum + val))}`}</div>
              <div className='date'>{item.order.shipped_on ? new Date(item.order.shipped_on).toLocaleDateString('en-GB', {month : 'short', day : 'numeric'}) : ''}</div>
            </div>
          </div>
        </li>
        {this.state.unwrapped[item.order.id] && <div id={'requested-dropdown' + item.order.id}>
          {this.renderItems(item.items, true)}
        </div>}
      </div>
    )
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
      <img alt='' src='./refresh.svg' className={`refresh-button ${this.state.loading ? 'loading' : ''}`} onClick={() => {this.startLoading(); this.props.parent.getAllItemsShipped()}}></img>
        <div className="box">
          <div className="header">
            <div className='title'>{list.listName}</div>
            <div className='stats'>{totalCount + ' units'}</div>
          </div>

          <div className="body">
            <ul className={"droptrue sortable " + this.state.draggable}>
              {list.listItems.map && !this.state.loading && list.listItems.map(item => {
                return item.map ? this.renderItems(item) : this.renderOrder(item)
              })}
            </ul>
          </div>
        </div>
      </div>
      </Fragment>
    )
  }
}
import React, { Component, Fragment } from 'react';
import {toast} from 'react-toastify';
import { groupBy } from 'lodash'
import { checkPrice, api, getThumbUrl } from '../../../Lib';
import { sortOrdersByActionRequests as sortByActionRequests}  from './utils/sort';

export default class RequestedItems extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: this.props.items,
      draggable: process.env.REACT_APP_DRAGGABLE.split(',').indexOf('Requested')!==-1 ? 'dragenabled' : '',
      unwrapped: {},
      loading: false,
      unwrappedItems: {},
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

  renderItems = (items, withoutOrder=true) => {
    const { parent, current_user_id } = this.props

    return items.map((item, index) => {
      let name = item.attributes.name
      let fullName = null
      const withAlert = withoutOrder && (item.attributes['need_sign'] || item.attributes['action-request'])
      if(withoutOrder &&  (item.attributes['need_sign'] || item.attributes['action-request'])) {
        if(name.length > 17) {
          fullName = name;
          name = name.slice(0, 15) + '..'
        }
      } else
      if(name.length > 19) {
        fullName = name;
        name = name.slice(0, 17) + '..'
      }


      return (
        <li key={'requested' + item.id + index} className={item.attributes['user-id']===current_user_id?"ui-state-highlight own":"ui-state-highlight"} onClick={e => e.stopPropagation()}>
          <div className={`itemCard ${!withAlert ? 'full-stats' : ''}`}>
            <img
              alt=''
              className='preview' 
              src={item.attributes.avatars.length ? getThumbUrl(item.attributes.avatars[0]) : './preview.svg'}
              onMouseDown={(e)=>{parent.setState({requestItem: {...item, type: this.props.items.dashboardType === 'producer' ? 'available' : null}});}} 
              onClick={(e)=>{parent.setState({requestViewForm: true, editItem: item, requestItems: null});parent.getAllRequests(item.id);}} 
            />
            <div className='main-stats' style={{width: '55%'}}>
              <div 
                className='item-name'
                onMouseDown={(e)=>{parent.setState({requestItem: {...item, type: this.props.items.dashboardType === 'producer' ? 'available' : null}});}} 
                onClick={(e)=>{parent.setState({requestViewForm: true, editItem: item, requestItems: null});parent.getAllRequests(item.id);}} 
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

            <div className='main-controls' style={{float: 'right'}}>
              {withoutOrder &&  (item.attributes['need_sign'] || item.attributes['action-request']) &&
                <img 
                  className="bell" 
                  alt="" 
                  src="./notification.svg"  
                  title=""
                  onMouseDown={(e)=>{parent.setState({requestItem: {...item, type: this.props.items.dashboardType === 'producer' ? 'available' : null}});}} 
                  onClick={(e)=>{parent.setState({requestViewForm: true, editItem: item, requestItems: null});parent.getAllRequests(item.id); console.log(item)}}
                />
              }
            </div>
            <div className='side-stats'>
              <div className='price'>
                {"$"+checkPrice(item.attributes['total-price'] * item.attributes.quantity)}
                <img
                  alt=''
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
                <div className='box'>
                  {item.attributes['target-user-name'].charAt(0).toUpperCase()}
                </div>
                <div className='user-name'>{item.attributes['target-user-name']}</div>
              </div>}

              <div className='item-data' style={{float: (item.attributes['target-user-name'] && withoutOrder) ? 'left' : 'right'}}>
                {!item.attributes.organic && <img src="./organic.svg" alt="" title="organic" className='organic'/>}
                <div className='grade'>
                  {parent.state.grades && (parent.state.grades.length>0) && (parent.state.grades.find(function(grade){
                    return grade.id === item.attributes['grade-id']
                  }) || {}).name}
                </div>
              </div>
            </div>}
          </div>
          {/* {current_user_id===item.attributes['user-id'] && <i className="fa fa-edit" onClick={(e)=>{e.stopPropagation();parent.setState({updateItemForm: true, editItem: item})}}></i>}
          {((current_user_id===item.attributes['user-id'])||checkIfType('admin')) && <i className="fa fa-trash" onClick={(e)=>{e.stopPropagation();parent.removeItem(item.id)}}></i>} */}
        </li>
      )
    })
  }

  renderOrder = item => {
    return (
      <div key={'requested-order' + item.order.id} className="order-box">
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
                {item.items.find(i => i.attributes['need_sign'] === true) && <img className="notification" alt='' src="./notification.svg"  title=""/>}
                {!item.items.find(i => i.attributes['shipped_at'] === null) && item.items.find(i => i.attributes['need_sign'] === true) && <img className='settle' alt='' src="./receive.svg"  title="" onClick={() => this.signOrder(item.order.id)}/> }
              </div>
              <div className='price'>{`$${checkPrice(item.items.map(i => {return Number(i.attributes['total-price']) * parseFloat(i.attributes.quantity)}).reduce((sum, val) => sum + val))}`}</div>
              <div className='date'>{item.order.estimated_date ? new Date(item.order.estimated_date).toLocaleDateString('en-GB', {month : 'short', day : 'numeric'}) : ''}</div>
            </div>
          </div>
        </li>
        {this.state.unwrapped[item.order.id] && <div id={'requested-dropdown' + item.order.id}>
          {this.renderItems(item.items, false)}
        </div>}
      </div>
    )
  }

  signOrder = id => {
    api.patch(`/v1/orders/${id}`, {order_action: {action_name: 'sign'}})
    .then(res => {
      toast.success('Order was succesfuly signed', {
        position: toast.POSITION.TOP_CENTER,
        hideProgressBar: true,
        autoClose: 2000
      })
      this.props.parent.getAllItemsReserved();
      this.props.parent.getAllItemsRequested();
      // TODO state change
    })
    .catch(err => {
      toast.error("Unable to sign order", {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: true,
        hideProgressBar: true
      })
    })
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

    return (
      <Fragment>
      {list.listItems && list.listItems.length > 0 && 
        <div className="column" style={{width: this.props.isListWidthAuto? 'calc(25% - 8px)': this.props.listFixedWidth}}>
          <img alt='' src='./refresh.svg' className={`refresh-button ${this.state.loading ? 'loading' : ''}`} onClick={() => {this.startLoading(); this.props.parent.getAllItemsRequested()}}></img>
          <div className="box">
            <div className="header">
              <div className='title'>{list.listName}</div>
              <div className='stats'>{totalCount + ' units'}</div>
            </div>

            <div className="body">
              <ul className={"droptrue sortable " + this.state.draggable}>
                {list.listItems.map && !this.state.loading &&  list.listItems.map(item => {
                  return item.map ? this.renderList(item) : this.renderOrder(item)
                })}
              </ul>
            </div>
          </div>
        </div>
      }
      </Fragment>
    )
  }
}
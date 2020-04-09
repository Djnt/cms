import React, { Component, Fragment } from 'react';
import { checkPrice, getThumbUrl } from '../../../Lib';
import { sortItemsByActionRequests as sortByActionRequests}  from './utils/sort'
import {
  isBrowser,
  isMobile
} from "react-device-detect";

export default class MyItems extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: this.props.items,
      draggable: process.env.REACT_APP_DRAGGABLE.split(',').indexOf('My items')!==-1 ? 'dragenabled' : '',
      loading: false
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

  safeRemoveItem = id => {
    if(window.confirm('Remove item?'))
      this.props.parent.removeItem(id);
  }

  renderItems = (items) => {
    const { parent } = this.props

    return items.map((item, index) => {
      const haveControls = item.attributes['need_sign'] || item.attributes['action-request']
      let name = item.attributes.name
      let fullName = null
      if(haveControls) {
        if(name.length > 17) {
          fullName = name;
          name = name.slice(0, 15) + '..'
        }
      } else {
        if(name.length > 18) {
          fullName = name;
          name = name.slice(0, 16) + '..'
        }
      }
      

      return (
        <li 
          key={'my' + item.id + index} 
          id={'my' + item.id} className={item.attributes.status + '  my-items'}
          onMouseEnter={(e) => {e.stopPropagation(); this.setState({menu: item.id, synth: true})}}
          onMouseLeave={(e) => {e.stopPropagation(); this.setState({menu: null, synth: true})}}
        >
          <div className={`itemCard  ${haveControls ? '' : 'full-stats'}`}>
            <img alt='' 
              className='preview' 
              src={item.attributes.avatars.length ? getThumbUrl(item.attributes.avatars[0]) : './preview.svg'}
              onMouseDown={(e)=>{e.stopPropagation(); this.closeMenus(); parent.setState({requestItem: {...item, owned: true,type: this.props.items.dashboardType === 'producer' ? 'available' : null}});}} 
              onClick={(e)=>{e.stopPropagation(); this.closeMenus(); parent.setState({requestViewForm: true, editItem: item, requestItems: null});parent.getAllRequests(item.id);}} 
            />

            <div className={`main-stats ${haveControls ? '' : 'wide-stats'}`}>
              <div 
                className='item-name'
                onMouseDown={(e)=>{this.closeMenus(); e.stopPropagation(); parent.setState({requestItem: {...item, owned: true,type: this.props.items.dashboardType === 'producer' ? 'available' : null}});}} 
                onClick={(e)=>{this.closeMenus(); e.stopPropagation(); parent.setState({requestViewForm: true, editItem: item, requestItems: null});parent.getAllRequests(item.id);}} 
              >
                {name}
                {fullName && <div aria-haspopup="true" className={`item-name-full ${item.attributes.status === 'available' ? 'my-name' : 'normal-name'}`}>{fullName}</div>}
              </div>
              <div className='quantity'>
                {`${item.attributes.quantity} ${item.attributes['unit-name']}`}
              </div>
            </div>

            <div className='main-controls'>
              
            </div>

            <div className='side-stats'>
              {(item.attributes['need_sign'] || item.attributes['action-request']) &&
                <img alt='' 
                  className="bell" 
                  src="./notification.svg"  
                  title=""
                  onMouseDown={(e)=>{e.stopPropagation(); this.closeMenus(); parent.setState({requestItem: {...item, owned: true, tab: 1, type: this.props.items.dashboardType === 'producer' ? 'available' : null}});}} 
                  onClick={(e)=>{e.stopPropagation(); this.closeMenus(); parent.setState({requestViewForm: true, editItem: item, requestItems: null});parent.getAllRequests(item.id); console.log(item)}} 
                />
              }
              <div className='price' style={{marginTop: haveControls ? '0px' : '22px'}}>
                {"$"+checkPrice(item.attributes['total-price'])}
              </div>

              {this.state.menu === item.id && <div className='hidden-controls' id={'menu-my' + item.id}>
                <img alt='' className="thrash" src='./thrash.svg' onClick={(e)=>{e.stopPropagation();this.safeRemoveItem(item.id); parent.getMyItems()}}></img>
                <div 
                  className={'slide ' + (item.attributes.status === 'available' ? 'ball-right' : 'ball-left')} 
                  onClick={() => {parent.changeInventoryStatus(item.id, (item.attributes.status === 'available' ? 'unavailable' : 'available'))}}
                >
                  <div className='ball'></div>
                </div>
              </div>}
            </div>

          </div>
        </li>
      )
    })
  }

  closeMenus = () => {
    this.setState({menu: null})
  }

  sortItems = val => {
    let { items } = this.state;

    switch(val) {
      case 'price_asc':
        items.producer.listItems = items.producer.listItems.sort((a, b) => {
          return a.attributes['total-price'] - b.attributes['total-price']
        })
        items.broker.listItems = items.broker.listItems.sort((a, b) => {
          return a.attributes['total-price'] - b.attributes['total-price']
        })
        break;
      case 'available_desc':
        items.producer.listItems = items.producer.listItems.sort((a, b) => {
          return a.attributes.status === 'available' &&  b.attributes.status !== 'available' ? -1 : a.attributes.status !== 'available' &&  b.attributes.status === 'available' ? 1 : 0
        })
        items.broker.listItems = items.broker.listItems.sort((a, b) => {
          return a.attributes.status === 'available' &&  b.attributes.status !== 'available' ? -1 : a.attributes.status !== 'available' &&  b.attributes.status === 'available' ? 1 : 0
        })
        break;
      case 'name_asc':
        items.producer.listItems = items.producer.listItems.sort((a, b) => {
          return a.attributes['name'].toLowerCase() > b.attributes['name'].toLowerCase() ? 1 : a.attributes['name'].toLowerCase() < b.attributes['name'].toLowerCase() ? -1 : 0
        })
        items.broker.listItems = items.broker.listItems.sort((a, b) => {
          return a.attributes['name'].toLowerCase() > b.attributes['name'].toLowerCase() ? 1 : a.attributes['name'].toLowerCase() < b.attributes['name'].toLowerCase() ? -1 : 0
        })
        break;
      case 'action':
        items.producer = sortByActionRequests(items.producer)
        break;
      default:
        break;
    }

    this.setState({items})
  }

  assignMenus = (e) => {
    document.documentElement.style.setProperty('--scr', `${-e.target.scrollTop}px`);
    if(this.state.menu)
      this.setState({menu: null})
    return true;
  }

  render() {
    let { producer } = this.state.items;
    let list = sortByActionRequests(producer)

    return (
      <Fragment>
      <div className="column" style={{width: this.props.isListWidthAuto? 'calc(25% - 8px)': this.props.listFixedWidth}}>
      <img alt='' src='./refresh.svg' className={`refresh-button ${this.state.loading ? 'loading' : ''}`} onClick={() => {this.startLoading(); this.props.parent.getMyItems()}}></img>
        <div className="box">
          <div className={`header ${this.state.filters ? 'semi-tall' : ''}`}>
            <div className='controls-main'>
              {isBrowser && <img alt='' className='filters-icon' src='./filters.svg' onClick={() => {this.setState({filters: !this.state.filters})}}></img>}
            </div>
            <div className='title'>{list.listName}</div>
            {isMobile && <img alt='' className='filters-icon-mobile' src='./filters.svg' onClick={() => {this.setState({filters: !this.state.filters})}}></img>}
            <div className='stats'>{(list.listItems || []).length + ' items'}</div>

            {this.state.filters && <div className='sorting'>
              <p>Sorting</p>
              <div className='custom-select-arrow'>
              <select onChange={e => this.sortItems(e.target.value)}>
                <option value='action'>Requested</option>
                <option value='available_desc'>Available first</option>
                <option value='price_asc'>Price ascending</option>
                <option value='name_asc'>Name</option>
              </select>
              <img alt='' src='./select_arrow.svg'></img>
              </div>
            </div>}
          </div>

          <div className="body" onScroll={e => this.assignMenus(e)}>
            <ul className={`sortable ${isBrowser ? this.state.filters ? 'with-bottom-unwrapped' : 'with-bottom' : ''} ${this.state.draggable}`}>
              {list.listItems && !this.state.loading && this.renderItems(list.listItems)}
            </ul>
            <div className='add-item-button mobile-hidden' onClick={()=>{this.closeMenus(); this.props.parent.setState({addItemForm: true})}} style={{cursor: 'pointer'}}>
              <h1>+</h1>
              <p>Add New Item</p>
            </div>
          </div>
        </div>
      </div>
      </Fragment>
    )
  }
}

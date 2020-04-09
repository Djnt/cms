import React, { Component, Fragment } from 'react';
import { checkIfType, checkPrice, getThumbUrl } from '../../../Lib';
import { sortItemsByActionRequests as sortByActionRequests}  from './utils/sort'
import {
  isBrowser,
  isMobile
} from "react-device-detect";

import { groupBy } from 'lodash'

export default class AvailableItems extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: this.props.items,
      draggable: process.env.REACT_APP_DRAGGABLE.split(',').indexOf('Available')!==-1 ? 'dragenabled' : '',
      wrap: false,
      unwrapped: new Array((this.props.items || []).length),
      filters: false,
      loading: false,
      synth: false,
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
    return Object.keys(items).map(k => {
      if (items[k].length === 1 || this.props.parent.state.wrapped === 'available' || k === 'null') {
        return this.renderItems(items[k])
      }
      else {
        return (
          <div className={`user-group ${!this.state.listed[k] ? 'unwrapped-group' : ''}`} onClick={() => this.setState({listed: {...this.state.listed, [k]: this.state.listed[k] ? false : true}})}>
            <div className='group-title'>{k}</div>
            <div style={{display: (!this.state.listed[k] ? 'block' : 'none')}}>{this.renderItems(items[k])}</div>
            <div className='br'></div>
          </div>
        )
      }
    })
  }
  
  renderItems = items => {
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
        if(name.length > 19) {
          fullName = name;
          name = name.slice(0, 17) + '..'
        }
      }

      return (
        <li 
          key={'requested' + item.id + index} 
          onClick={(e) => {e.stopPropagation()}}
          onMouseEnter={(e) => {e.stopPropagation(); this.setState({menu: item.id, synth: true})}}
          onMouseLeave={(e) => {e.stopPropagation(); this.setState({menu: null, synth: true})}}
        >
          <div className={`itemCard ${haveControls ? '' : 'full-stats'}`}>
            <img alt='' 
              className='preview' 
              src={item.attributes.avatars.length ? getThumbUrl(item.attributes.avatars[0]) : './preview.svg'}
              onMouseDown={(e)=>{e.stopPropagation(); this.closeMenus(); parent.setState({requestItem: {...item, type: this.props.items.dashboardType === 'producer' ? 'available' : null}});}} 
              onClick={(e)=>{e.stopPropagation(); this.closeMenus(); parent.setState({requestViewForm: true, editItem: item, requestItems: null});parent.getAllRequests(item.id);}} 
            />

            <div className='main-stats'>
              <div 
                className='item-name'
                onMouseDown={(e)=>{e.stopPropagation(); this.closeMenus(); parent.setState({requestItem: {...item, type: this.props.items.dashboardType === 'producer' ? 'available' : null}});}} 
                onClick={(e)=>{e.stopPropagation(); this.closeMenus(); parent.setState({requestViewForm: true, editItem: item, requestItems: null});parent.getAllRequests(item.id);}}
              >
                {name}
                {fullName && <div aria-haspopup="true" className='item-name-full normal-name'>{fullName}</div>}
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
                  onMouseDown={(e)=>{e.stopPropagation(); this.closeMenus(); parent.setState({requestItem: {...item, tab: 1, type: this.props.items.dashboardType === 'producer' ? 'available' : null}});}} 
                  onClick={(e)=>{e.stopPropagation(); this.closeMenus(); parent.setState({requestViewForm: true, editItem: item, requestItems: null});parent.getAllRequests(item.id);}} 
                />
              }
              <div className='price'>
                {"$"+checkPrice(item.attributes['total-price'])}
                  {this.props.parent.state.wrapped !== 'available' && <img alt='' 
                  className={`drop-down ${this.state.unwrapped[index] ? 'reverted' : ''}`} 
                  src='./downwrap.svg'
                  onClick={(e) => {
                    e.stopPropagation()
                    let unwrapped = this.state.unwrapped
                    unwrapped[index] = !unwrapped[index]
                    this.setState({unwrapped})
                  }}
                />}
              </div>

               
              {this.state.menu === item.id && checkIfType('admin') && <div className='hidden-controls cloud-menu-available' id={'menu-my' + item.id}>
                <img alt='' className="thrash" src='./thrash.svg' onClick={(e)=>{e.stopPropagation();  this.setState({menu: null}); this.props.parent.removeItem(item.id)  }}></img>
              </div>}
            </div>

            {(this.state.unwrapped[index] || this.props.parent.state.wrapped === 'available') && <div className='additional-stats'>
              <div className='user-data'>
                <div className='box'>
                  {item.attributes['target-user-name'].charAt(0).toUpperCase()}
                </div>
                <div className='user-name'>{item.attributes['target-user-name']}</div>
              </div>

              <div className='item-data'>
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

  closeMenus = () => {
    this.setState({menu: null})
  }

  assignMenus = (e) => {
    document.documentElement.style.setProperty('--scr-a', `${-e.target.scrollTop}px`);
    if(this.state.menu && this.state.synth === false)
      this.setState({menu: null})
    return true;
  }

  render() {
    let { dashboardType, broker, producer } = this.state.items;
    let data = dashboardType === 'broker' ? broker : producer;
    const that = this.props.parent
    let list = {listName: data.listName, listItems: data.listItems}

    if(data.listName==='Available'){
      if(that.state.dateFilter===2){
        list.listItems = data.listItems; 
      } 
      if(that.state.dateFilter===1){
        list.listItems = data.listItems.filter(item => new Date(item.attributes['date-available'])>new Date()) 
      } 
      if(that.state.dateFilter===0){
        list.listItems = data.listItems.filter(item => new Date(item.attributes['date-available'])<=new Date()) 
      }
    }

    list = sortByActionRequests(list)
    const length = list.listItems.length
    list.listItems = groupBy(list.listItems, i => i.attributes['target-user-name'])

    return (
      <Fragment>
      <div className={`column ${this.props.parent.state.wrapped === 'available' ? "full" : ""}`} style={{width: this.state.wrap ? "calc(100% - 10px)" : this.props.isListWidthAuto? '': this.props.listFixedWidth}} onClick={e => e.stopPropagation()}>
        <img alt='' src='./refresh.svg' className={`refresh-button ${this.state.loading ? 'loading' : ''}`} onClick={() => {this.startLoading(); this.props.parent.getAllItemsAvailable()}}></img>
        <div className="box">
          <div className={`header  ${dashboardType==='broker' && this.state.filters ? 'tall' : ''}`}>
            <div className='controls-main'>
              {isBrowser && <img alt='' className='filters-icon' src='./filters.svg' onClick={() => {this.setState({filters: !this.state.filters})}}></img>}
            </div>
            <div className='title'>{list.listName}</div>
            <img alt='' 
              src='./arrow.svg' 
              className={`wrap-button phone-disabled ${this.props.parent.state.wrapped === 'available' ? "" : 'right'}`} 
              onClick={() => this.props.parent.setState({wrapped: this.props.parent.state.wrapped === 'available' ? "" : "available"})}
            ></img>
            {isMobile && <img alt='' className='filters-icon-mobile' src='./filters.svg' onClick={() => {this.setState({filters: !this.state.filters})}}></img>}
            <div className='stats'>{length + ' items'}</div>
            

            {this.state.filters && <div className='filters'>
              {dashboardType==='broker' && <div className="dateFilter"> 
                <span className={'first ' + (that.state.dateFilter === 0 ? 'active' : '')} onClick={(e)=>that.setState({dateFilter: 0})}>Now</span>
                <span className={that.state.dateFilter === 1 ? 'active' : ''} onClick={(e)=>that.setState({dateFilter: 1})}>Soon</span>
                <span className={'last ' + (that.state.dateFilter === 2 ? 'active' : '')} onClick={(e)=>that.setState({dateFilter: 2})}>Anytime</span>
              </div>}

              {that.state.selected && dashboardType === 'broker' && <div className="slider-depth">  
                
                <input type="range" min={2} max={5} onChange={(e)=>{localStorage.setItem("degree", e.target.value);that.getAllItemsAvailable(that.props.dashboardType, e.target.value);}} defaultValue={localStorage.getItem("degree")?localStorage.getItem("degree"):3} step={1} />
                <p>closer</p>
                <p className='right'>further</p></div>
              }
            </div>
            }
          </div>

          <div className="body" onScroll={e => this.assignMenus(e)}>
            <ul className={`droptrue sortable  ${this.state.draggable} ${dashboardType==='broker' && this.state.filters ? 'tall-body' : ''}`}>
              {list.listItems && !this.state.loading && this.renderList(list.listItems)}
            </ul>
          </div>
        </div>
      </div>
      </Fragment>
    )
  }
}
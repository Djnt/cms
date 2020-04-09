import React, { Component, Fragment } from 'react';
import { checkPrice, getThumbUrl } from '../../../Lib';
import { sortItemsByActionRequests as sortByActionRequests}  from './utils/sort'

export default class AroundItems extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: this.props.items,
      draggable: process.env.REACT_APP_DRAGGABLE.split(',').indexOf('What\'s around')!==-1 ? 'dragenabled' : '',
      unwrapped: new Array((this.props.items || []).length),
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

  renderItems = (items) => {
    const { parent } = this.props

    return items.map((item, index) => {
      let name = item.attributes.name
      let fullName = null
      if(name.length > 19) {
        fullName = name;
        name = name.slice(0, 17) + '..'
      }

      return (
        <li key={'requested' + item.id + index}>
          <div className="itemCard full-stats">
            <img
              alt=''
              className='preview' 
              src={item.attributes.avatars.length ? getThumbUrl(item.attributes.avatars[0]) : './preview.svg'}
              onMouseDown={(e)=>{parent.setState({requestItem: {...item, itemType: 'around' , type: this.props.items.dashboardType === 'producer' ? 'available' : null}});}} 
              onClick={(e)=>{parent.setState({requestViewForm: true, editItem: {...item, itemType: 'around'}, requestItems: null});parent.getAllRequests(item.id);}} 
            />

            <div className='main-stats'>
              <div 
                className='item-name'
                onMouseDown={(e)=>{parent.setState({requestItem: {...item,itemType: 'around', type: this.props.items.dashboardType === 'producer' ? 'available' : null}});}} 
                onClick={(e)=>{parent.setState({requestViewForm: true, editItem: {...item, itemType: 'around'}, requestItems: null});parent.getAllRequests(item.id);}} 
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
              <div className='price'>
                {"$"+checkPrice(item.attributes['total-price'])}
                <img 
                  alt=''
                  className={`drop-down ${this.state.unwrapped[index] ? 'reverted' : ''}`} 
                  src='./downwrap.svg'
                  onClick={() => {
                    let unwrapped = this.state.unwrapped
                    unwrapped[index] = !unwrapped[index]
                    this.setState({unwrapped})
                  }}
                />
              </div>
            </div>

            {this.state.unwrapped[index] && <div className='additional-stats'>
              <div className='item-data' style={{float: 'right'}}>
                {!item.attributes.organic && <img src="./organic.svg" alt="" title="organic" className='organic'/>}
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

  render() {
    let { producer } = this.state.items;
    let list = sortByActionRequests(producer)

    return (
      <Fragment>
      <div className="column double" style={{width: this.props.isListWidthAuto? '28%': this.props.listFixedWidth  }}>
        <img alt='' src='./refresh.svg' className={`refresh-button ${this.state.loading ? 'loading' : ''}`} onClick={() => {this.startLoading(); this.props.parent.getAroundItems()}}></img>
        <div className="box">
          <div className="header">
            <div className='title'>{list.listName}</div>
            <div className='stats'>{(list.listItems || []).length + ' items'}</div>
          </div>

          <div className="body">
            <ul className={"sortable " + this.state.draggable}>
              {list.listItems && !this.state.loading && this.renderItems(list.listItems)}
            </ul>
          </div>
        </div>
      </div>
      </Fragment>
    )
  }
}
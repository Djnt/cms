import React, { Component } from 'react';

export default class BurgerMenu extends Component {
  state = {
    wrapped: false,
    current: 0
  }

  changeTab = id => {
    this.setState({
      current: id,
      wrapped: false
    })
    this.props.changeTab(id)
  }

  render() {
    const { current } = this.state
    return (
      <div>
      <img alt='' src='./burger.svg' className='burger-button' onClick={() => this.setState({wrapped: !this.state.wrapped})}></img>
        <div className='burger-menu-container'>
          {this.state.wrapped && <div className='burger-menu-body'>
            {this.props.dashboardType !== 'producer' &&  <h2 onClick={() => this.changeTab(0)} className={current === 0 ? 'active' : ''}> Available </h2>}
            {<h2 onClick={() => this.changeTab(4)} className={current === 4 ? 'active' : ''}> My Items </h2>}
            {<h2 onClick={() => this.changeTab(1)} className={current === 1 ? 'active' : ''}> Requested </h2>}
            {<h2 onClick={() => this.changeTab(2)} className={current === 2 ? 'active' : ''}> Holding </h2>}
            {<h2 onClick={() => this.changeTab(3)} className={current === 3 ? 'active' : ''}> Shipped </h2>}
            {this.props.dashboardType === 'producer' && <h2 onClick={() => this.changeTab(5)} className={current === 5 ? 'active' : ''}> Around </h2>}
          </div>}
        </div>
      
      </div>
    )
  }
}
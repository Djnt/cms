import React, { Component, Fragment } from 'react';
import { getThumbUrl, getUrl, getThumbBigUrl } from '../../Lib';

export default class GalleryPreview extends Component {
  state = {
    items: this.props.items.map(i => getThumbBigUrl(i)),
    zoom: (this.props.zoom === 0 ? 0 : false),
    slider: 0,
  }

  componentDidMount = () => {
    window.$('.avatar-cover-zoom').zoom({url: this.state.items[this.props.selectedAvatar].replace('thumb500_', '')})
  }

  zoom = index => {
    this.props.reset()
    this.setState({zoom: index})
  }

  swipe = direction => {
    const { zoom, items } = this.state
    if (this.props.zoom === 0) {
      this.props.reset()
      this.zoom(0)
    }

    if(direction === 'left') {
      zoom > 0 ? this.setState({zoom: zoom - 1}) : this.setState({zoom: items.length - 1})
    }
    if(direction === 'right') {
      zoom >= items.length - 1 ? this.setState({zoom: 0}) : this.setState({zoom: zoom + 1})
    }
  }

  scroll = direction => {
    const target = document.getElementById('itemAvatarsPreview')
    const diff = direction === 'left' ? -15 : 15;
    let step = 1
    const smooth = setInterval(() => {
      target.scroll({left: target.scrollLeft + diff})
      step += 1;
      if(step === 10)
        clearInterval(smooth)
    }, 20)
  }

  changeAvatar = index => {
    window.$('.avatar-cover-zoom').zoom({url: this.state.items[index].replace('thumb500_', '')})
    this.props.changeAvatar(index)
  }

  render () {
    const { items } = this.state;
    const zoom = (this.props.zoom === 0 ? 0 : this.state.zoom)

    return (
      <Fragment>
      <div className='itemAvatars' id='itemAvatarsPreview'>
        {items.length > 0 && items.map((avatar, index) => {
          return avatar && <img className={`itemAvatar ${this.props.selectedAvatar === index ? 'selected' : ''}`} key={avatar} id={avatar} src={getThumbUrl(avatar)} alt='' onClick={() => this.changeAvatar(index)}/>
        })}
      </div>
      {zoom !== false && <div>
        <div className='avatarZoomed'>
          <img className='fullImage' src={items[zoom]} alt=''/>
          <div className='controls'>
            <img className='close' src='./close.png' alt='' onClick={() => { this.props.reset(); this.setState({zoom: false}) }}/>
            <div className='slider-left' onClick={() => this.swipe('left')}>
              <img alt='' src='./back.png' />
            </div>
            <div className='slider-right' onClick={() => this.swipe('right')} >
              <img alt='' src='./forward.png'/>
            </div>
          </div>
        </div>
      </div>
      }
      </Fragment>
    )
  }
}
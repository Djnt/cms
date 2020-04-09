import React, {Component} from 'react';
import {formatDate} from '../../Lib';
import { toast } from 'react-toastify';
import { api } from '../../Lib';
import { FullScreenWindow } from '../fullScreenWindow'

export default class OrderEditor extends Component {
  state = {
    order: {
      ...this.props.order.order,
      estimated_date: this.props.order.estimated_date || formatDate(new Date()),
      location: this.props.order.location || 'pick up'
    }
  }

  updateField = (val, field) => {
    let { order } = this.state
    order[field] = val
    this.setState({ order })
  }

  validationError = error => {
    toast.error(error, {
      position: toast.POSITION.BOTTOM_CENTER,
      autoClose: true,
      hideProgressBar: true
    })
  }

  updateItem = () => {
    let data = this.state.order
    if(!data['order_label']) {
      this.validationError("order label is required!")
      return
    }
    if(!data['estimated_date']) {
      this.validationError("estimated date is required!")
      return
    }
    if(!data['location']) {
      this.validationError("location is required!")
      return
    }
    if(data['location'] === 'other' && !data['note']) {
      this.validationError("Other location note is required!")
      return
    }

    let result = new FormData()
    result.append('order[order_label]', data['order_label'])
    result.append('order[estimated_date]', data['estimated_date'])
    if(data['estimated_time'])
      result.append('order[estimated_time]', data['estimated_time'])
    result.append('order[location]', data['location'])
    if(data['note'] && data['location'] === 'other')
      result.append('order[note]', data['note'])

    api.patch(`/v1/orders/${this.state.order.id}`, result)
    .then(res => {
      toast.success('Item successfully updated!', {
        position: toast.POSITION.TOP_CENTER,
        hideProgressBar: true,
        autoClose: 2000
      })
      this.props.callback();
    })
    .catch(err => {
      toast.error(err.message, {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: false,
        hideProgressBar: true
      })
    })  
  }

  render () {
    const attributes = this.state.order
    console.log(this.state.order)

    return(
      <FullScreenWindow close={this.props.close}>
      <div className="edit-order" onClick={(e)=>e.stopPropagation()}>
        <h3 className="align-center"> {"Update Order"} </h3>
        <div className="formField">
          <label>order label</label> 
          <input id="update_form_label" type="text" defaultValue={attributes['order_label']} onChange={e => this.updateField(e.target.value, 'order_label')}/>
        </div>

        <div className="formField">
          <label>estimated date</label> 
          <input id="update_form_available" type="date" 
            defaultValue={attributes['estimated_date'] ? formatDate(attributes['estimated_date']): null}
            onChange={e => this.updateField(e.target.value, 'estimated_date')}
          />
        </div>

        <div className="formField">
          <label>estimated time</label> 
          <input id="update_form_available" type="time" 
            defaultValue={attributes['estimated_time'] ? formatDate(attributes['estimated_time']): null}
            onChange={e => this.updateField(e.target.value, 'estimated_time')}
          />
        </div>

        <div className="formField">
          <label>location</label> 
          <select id="update_form_available"
            defaultValue={attributes['location'] || 'delivery'}
            onChange={e => this.updateField(e.target.value, 'location')}
          >
            <option>pick up</option>
            <option>delivery</option>
            <option>other</option>
          </select>
        </div>

        {this.state.order.location === 'other' && <div className="formField">
          <textarea id="update_form_available" type="text" 
            cols="40" 
            rows="5" 
            defaultValue={attributes['note'] || ''}
            onChange={e => this.updateField(e.target.value, 'note')}
            style={{width: '90%'}}
          />
        </div>}

        <div className="formField mt-15 align-center">
          <button className="submitButton" onClick={this.updateItem}>
            {"Update order"}
          </button>
        </div>
      </div>
      </FullScreenWindow>
    )
  }

}
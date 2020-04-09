import React, {Component} from 'react';
import {checkIfQuantity, checkPrice, formatDate, addDays} from '../../Lib';
import { toast } from 'react-toastify';
import { api } from '../../Lib';
import $ from 'jquery';

export default class UpdateForm extends Component {
  state = {
    attributes: this.props.attributes || {},
    categories: this.props.categories,
    grades: this.props.grades,
    itemId: this.props.itemId,
    touchedAttributes: {},
    avatars: this.props.attributes.avatars || [],
    touchedAvatars: [0, 1]
  }

  componentDidMount () {
    $('#form_name').on( "autocompleteselect", ( event, ui ) => {
      this.updateField(ui.item.label, 'name')
    } );
  }

  updateField = (val, field) => {
    let { attributes } = this.state
    attributes[field] = val
    this.setState({ attributes: attributes })
  }

  updateImages = (files) => {
    console.log(files, 'updateImage()')
    this.setState({avatars: files})
  }

  validationError = error => {
    toast.error(error, {
      position: toast.POSITION.BOTTOM_CENTER,
      autoClose: true,
      hideProgressBar: true
    })
  }

  updateItem = () => {
    let data = this.state.attributes
    if(!data['name']) {
      this.validationError("Name is required!")
      return
    }
    if(!data['grade-id']) {
      if(!this.state.grades && !this.state.grades.length){
        this.validationError("Grade is required!")
        return
      }
      data['grade-id'] = this.state.grades.sort((a, b) => a.id < b.id)[0].id
    }

    data['organic'] = data['organic'] || false
    if(!data['date-available'] && !this.props.newItem) {
      this.validationError("Available date is required!")
      return
    } else if(this.props.newItem && !data['date-available']){
      data['date-available'] = (new Date()).toUTCString()
    } else {
      data['date-available'] = (new Date(data['date-available'])).toUTCString()
    }
     
    if(!data.quantity || Number.isNaN(Number(data.quantity))) {
      this.validationError("Quantity is required and should be a number!")
      return
    }
    if(!data['total-price'] || Number.isNaN(Number(data['total-price']))) {
      this.validationError("Price is required and should be a number!")
      return
    }

    let result = new FormData()
    result.append('item[name]',data['name'])
    result.append('item[category_id]', this.state.categories[0].id || 1) //category_id
    result.append('item[grade_id]', data['grade-id'])
    result.append('item[quantity]', data['quantity'])
    result.append('item[unit]', 'lbs');
    result.append('item[price]' ,data['total-price']);
    result.append('item[organic]', data['organic']);
    result.append('item[date_available]', data['date-available']);

    if(this.props.newItem) {
      result.append('dtype', this.props.attributes.dtype)
      api.post(`/v1/items`, result)
      .then(res => {
        toast.success('Item successfully added!', {
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
    } else {
      api.put(`/v1/items/${this.state.itemId}`, result)
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
  }

  render () {
    const {categories, attributes, grades} = this.props;
    return(
      <div className="edit-item-form" onClick={(e)=>e.stopPropagation()}>
        <div className='content'>
          <img src='./cross.svg' alt='' onClick={this.props.close} className='close'/>
          <h3 className="align-center"> {this.props.newItem ? "Add New Item" : "Update Item"} </h3>
          <div className="formField">
            <label>Category:</label> 
            <input type="text" className="unselectable" readOnly value={categories && categories.length > 0 && categories[0].category_name}/>
          </div>
          <div className="formField">
            <label>Name:</label> 
            <input id="form_name" className="ui-autocomplete-input" defaultValue={attributes.name} onChange={e => this.updateField(e.target.value, 'name')}/>
          </div>
          <div className="formField">
            <label>Grade:</label> 
            <select id="update_form_grade" defaultValue={attributes['grade-id']} onChange={e => this.updateField(e.target.value, 'grade-id')}>
              {
                grades && grades.length > 0 && grades.sort((a, b) => a.id < b.id).map(function(grade, index){
                  return <option key={index} value={grade.id}>{grade.name}</option>
                })
              }
            </select>
            <img alt='' src='./select_arrow.svg'></img>
          </div>
          <div className="formField small">
            <label>Quantity:</label> 
            <input id="update_form_quantity" type="number" defaultValue={checkIfQuantity(attributes.quantity)} onChange={e => this.updateField(e.target.value, 'quantity')}/>
          </div>
          <div className="formField small small-title" style={{float: 'right', textAlign: 'right'}}>
            <label>Price:</label>
            <input id="update_form_price" type="number" defaultValue={checkPrice(attributes['total-price'])} onChange={e => this.updateField(e.target.value, 'total-price')}/>
          </div>
          <div className="formField">
            <input id="update_form_unit" type="hidden" value="lbs"/>
          </div>
          <div className="formField">
            <label>Available Date:</label> 
            <input id="update_form_available" type="date" 
              defaultValue={attributes['date-available'] ? formatDate(attributes['date-available']): formatDate(new Date())}
              min={formatDate(attributes['created-at'] || new Date())}
              max={formatDate(addDays(new Date(attributes['created-at'] || new Date()), process.env.REACT_APP_AVAILABLE_DAYS_LIMIT || 14))}
              onChange={e => this.updateField(e.target.value, 'date-available')}
            />
          </div>

          <div className="formField organform">
            <label>Organic:</label>
            <div>
              <input className="organic" type="radio" name="organic" value={1} defaultChecked={attributes.organic===true?true:false} onChange={e => this.updateField(true, 'organic')}/> Y
              <input className="organic right" type="radio" name="organic" value={0} defaultChecked={(attributes.organic===false || !attributes.organic || this.props.newItem)?true:false} onChange={e => this.updateField(false, 'organic')}/> N
            </div>
          </div>

          <div className="formField mt-15 align-center">
            <button className="submitButton" onClick={this.updateItem}>
              {this.props.newItem ? "Save Item" : "Update Item"}
            </button>

            <button className="backButton" onClick={this.props.close}>
              Back
            </button>
          </div>
        </div>
      </div>
    )
  }

}
import React, {Fragment} from 'react';
import { checkPrice, checkIfQuantity, formatItemDate } from '../../../../Lib';

export const PriceAndQuantity = (item, overridePrice=null) => {
  return (
    <Fragment>
      <div className="quantity">
        {checkIfQuantity(item.attributes.quantity)}
      </div>
      <div className="price">
        {"$"+checkPrice(overridePrice || item.attributes['total-price'])}
      </div>
    </Fragment>
  )
}

export const itemDateAvailable = item => {
  if (new Date(item.attributes['date-available']) > new Date())
    return <div className="date">
      <i className="fa fa-clock-o" aria-hidden="true"></i>
      {formatItemDate(new Date(item.attributes['date-available']))}
    </div>
}
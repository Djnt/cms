import React from 'react';
import {
  isBrowser
} from "react-device-detect";

export const PrimaryWindow = props => {

  return (
    <div className='primary-window' onClick={props.bounds}>
      <div className='row'>
        <div className='col-lg-4 col-md-12 offset-lg-4  content'>
          <div className='close'>
            <img alt='' src={isBrowser ? './cross.svg' : './arrow.svg'} onClick={props.close}></img>
          </div>
          <div className='child-content'>
            {props.children}
          </div>
        </div>
      </div> 
    </div>
  )
}

export default PrimaryWindow;
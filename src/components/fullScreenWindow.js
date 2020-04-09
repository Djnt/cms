import React from 'react';
import {
  isBrowser
} from "react-device-detect";

export const FullScreenWindow = props => {

  return (
    <div className='full-window'>
      <div className='row'>
        <div className='content'>
          <div className='close' onClick={props.close}>
            <img alt='' src={isBrowser ? './cross.svg' : './arrow.svg'}></img>
          </div>
          <div className='child-content'>
            {props.children}
          </div>
        </div>
      </div> 
    </div>
  )
}

export default FullScreenWindow;

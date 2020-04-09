import React, {Component, Fragment} from 'react';
import { toast } from 'react-toastify';
import Loader from 'react-loader-spinner';
import { getBase64Strings } from 'exif-rotate-js/lib';
import ImageEditor from './editor';
import { api, getThumbUrl } from '../../Lib';

export default class AvatarsUploader extends Component {
  constructor(props){
    super(props)
    this.state = {
      amount: props.amount || 5,
      images: props.images,
      urls: props.images,
      thumbnails: (props.images || []).map(i => getThumbUrl(i)),
      origins: props.images.map(i => {return {add: i, n: ''}}),
      owner: props.isOwner,
      editing: false,
      name: null,
      percents: null
    }
  }

  upload = (skipCallback=false) => {
    this.setState({loading: true})
    let result = new FormData()
    this.state.images.map((item, i) => {
      // alert(this.state.origins[i].add)
      if((this.state.thumbnails[i] && this.props.images[i]) || (typeof item === 'string' && item.includes('blob:')))
        return result.append('source_images[]', (this.state.origins[i]  ? this.state.origins[i].add : this.state.images[i]))
      return result.append('source_images[]', item)
      
    })
    this.state.thumbnails.map((item, i) => {
      return result.append('inventory_avatars[]', item)
    })

    const progress = progressEvent => {
      var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      console.log(percentCompleted)
      this.setState({percents: percentCompleted})
    }

    api.put(`/v1/items/${this.state.owner}`, result, {timeout: 40000, onUploadProgress: progress})
    .then(res => {
      this.setState({loading: false})
      toast.success('Gallery updated!', {
        position: toast.POSITION.TOP_CENTER,
        hideProgressBar: true,
        autoClose: 2000
      })
      if(!skipCallback) this.props.callback(res);
    })
    .catch(err => {
      this.setState({loading: false})
      toast.error(err.message, {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: true,
        hideProgressBar: true
      })
    })
    .finally(_ => {
      this.setState({percents: null})
    })
  }

  onDrop = this.onDrop.bind(this);

  async onDrop(picture, index=null) {
    if(this.state.images.length - this.state.images.filter(i => i === null).length > 4) {
      toast.error("can not load more than 5 images", {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: true,
        hideProgressBar: true
      })
      return
    }

    var reader = new FileReader();
    const applyState = this.applyState.bind(this)

    const pic = await getBase64Strings([picture], { maxSize: 4086 })

    var binary = atob(pic[0].split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    
    // // var the_file = new Blob([new Uint8Array(array)],  {type: picture.type, encoding: 'utf-8'})

    // console.log(pic)
    // //rename
    // // var blob = Buffer.from(pic[0]);
    // // console.log(blob)
    let newFile = new File([new Uint8Array(array)], Date.now() + picture.name, {type: picture.type});
    reader.onload = function(e) {
      applyState(newFile, e.target.result, index)
    }
    reader.readAsDataURL(newFile);

  }

  applyState(picture, url, index=null) {
    this.setState({
      images: this.state.images.concat(picture),
      urls: this.state.urls.concat(url),
      editing: this.state.urls.length, //auto edit purpose
    });
  }

  removeImage = index => {
    let {images, urls, thumbnails} = this.state
    images[index] = null
    urls[index] = null
    thumbnails[index] = null
    this.setState({
      images,
      urls,
      thumbnails,
    });
    this.upload(false);
  }

  openEditor = index => {
    const data = this.state.images[index]
    const newName = this.state.origins[index] ? this.state.origins[index].add.split('/').pop() : this.state.images[index].name
    if(typeof data !== 'string'){
      this.setState({editing: index})
    } else {
      fetch(data, { headers: {'Authorization': localStorage.getItem('Token')} })
      .then(res => {
        res.blob()
        .then(blob => {
          const { images, urls } = this.state;
          images[index] = new File([blob], data.split('/').pop(), {type: blob.type})
          urls[index] = URL.createObjectURL(blob)
          this.setState({editing: index, urls, images, name: newName})
        })
      })
    }
  }
  editImage = (image, override=true) => {
    this.setState({name: null})
    if(!image) {
      this.setState({editing: false})
    } else {
      let {editing, thumbnails} = this.state
      if(override || !thumbnails[editing]) thumbnails[editing] = image
      this.setState({ thumbnails, editing: false })
    }

    this.upload(false)
  }

  render () {
    const { urls, thumbnails, percents } = this.state
    return(
      <Fragment>
        {this.state.editing === false && 
          <div className="edit-gallery">
            <h2>Edit gallery</h2>
            <div className='avatarsBlock'>
            {thumbnails.length > 0 && urls.map((url, index) => {
                return url && (
                <div key={url+index}>
                  <div className='image-preview' style={{backgroundImage: `url(${url})`}} alt=''>
                    {this.state.owner && <div className='fast-controls'>
                      <img src='./thrash.svg' alt='' className='edit-img' onClick={() => this.removeImage(index)}></img>
                      <img src='./edit.svg' alt='' className='delete-img' onClick={() => this.openEditor(index)}></img>
                    </div>}
                  </div>
                </div>
                )
            })}
            </div>
          </div>
        }
        {this.state.editing !== false  &&
          <ImageEditor
            src={this.state.urls[this.state.editing]}
            fileName={this.state.name || this.state.images[this.state.editing].name || this.state.images[this.state.editing].split('/').pop()}
            makeCrop={(image) => this.editImage(image)}
          />
        }
        <div className="formField mt-15 align-center">
          {this.state.loading ? 
            <div>
              <Loader 
                type="Oval"
                color="black"
                height="50"	
                width="50"
              />
              {percents !== null && <div style={{position: 'absolute', marginTop: '-37px', width:  (percents === 100 ? '120px' : '50px'), textAlign: 'center', marginLeft: (percents === 100 ? '55px' : '0px')}}>{percents < 100 ? percents + '%' : 'processing...' }</div>}
            </div>
            :
            <div className='controls'>
              {this.state.editing === false &&
                <div>
                  {this.state.owner && 
                    <div>
                      <input type='file' accept='image/*' id='image-input' onChange={e => this.onDrop(e.target.files[0])} style={{display: 'none'}}></input>
                      <label htmlFor='image-input' className='uploadsButton'>
                        Add file
                      </label>    
                    </div>
                  }
                  <button className='back-button' onClick={this.props.goBack}>Back</button>
                </div>
              }
              
            </div>
          }

        </div>
      </Fragment>
      
    )
  }

}

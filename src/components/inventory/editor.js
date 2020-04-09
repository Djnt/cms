import React, { PureComponent } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export default class ImageEditor extends PureComponent {
  state = {
    src: this.props.src,
    name: this.props.fileName,
    crop: {
      unit: "px",
      width: 400,
      aspect: 1
    }
  };

  // If you setState the crop in here you should return false.
  onImageLoaded = image => {
    this.imageRef = image;
  };

  onCropComplete = crop => {
    this.makeClientCrop(crop);
  };

  onCropChange = (crop, percentCrop) => {
    this.setState({ crop });
  };

  async makeClientCrop(crop) {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(
        this.imageRef,
        crop,
        'thumbnail_' + this.state.name
      );
      this.setState({ croppedImageUrl });
    }
  }

  getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement("canvas");
    canvas['origin-clean'] = false
  
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          console.error("Canvas is empty");
          return;
        }
        blob.name = fileName;
        window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);
        this.outputFile = blob
        resolve(this.fileUrl);
      }, "image/jpeg");
    });
  }

  saveImage = () => {
    if (this.outputFile)
      this.props.makeCrop(new File([this.outputFile], 'thumbnail_' + this.state.name))
    else
      this.props.makeCrop(null, null)
  }

  cancel = () => {
    this.props.makeCrop(new File([this.outputFile], 'thumbnail_' + this.state.name), false)
  }

  render() {
    const { crop, src } = this.state;

    return (
      <div className="App">
        {src && (
          <div style={{maxHeight: '400px', textAlign: 'center'}}>
          <ReactCrop
            src={src}
            crop={crop}
            onImageLoaded={this.onImageLoaded}
            onComplete={this.onCropComplete}
            onChange={this.onCropChange}
          />
          </div>
        )}
        <div>
          <button className='edit-save' onClick={this.saveImage}>SAVE</button>
          <button className='edit-cancel' onClick={this.cancel}>CANCEL</button>
        </div>
      </div>
    );
  }
}
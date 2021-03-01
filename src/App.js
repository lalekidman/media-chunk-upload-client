import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import {v4 as uuid} from 'uuid'
const SERVER_HOST = 'http://localhost:5002'
const chunkSize = ((1024 * 1024) * 8) // 8mb
const uploadFiles = (file, fileId) => {
  const httpOptions = {
    url: `${SERVER_HOST}/upload`,
    onAbort: () => {
      console.log('@on abort');
    },
    onError: () => {
      console.log('@on onError');
    },
    onProgress: () => {
      console.log('@on onProgress');
    },
    onComplete: () => {
      console.log('@on onComplete');
    },
  }

  const uploadToServer = (file, options) => {
    const request = new XMLHttpRequest()
    const formData = new FormData()
    
    formData.append('blob', file, file.name)
    request.open("POST", options.url, true)
    request.setRequestHeader('X-File-Id', fileId)

    request.onload = () => options.onComplete();

    request.upload.onprogress = () => options.onProgress();

    request.onerror = (e) => options.onError(e);
    
    request.onabort = (e) => options.onAbort(e);

    request.ontimeout = (e) => options.onError(e);
    request.send(formData);
  }
  // console.log('file :>> ', file);
  // console.log('file :>> ', file);
  // blobStorage.upload(productId, file)
  uploadToServer(file, httpOptions)
}
const MainContainer = () => {
  // const inputFile = useRef(null)
  const handleFileOnChange = async (ev) => {
    const file = ev.target.files[0]
    const x = Math.ceil(file.size / chunkSize)
    const fileId = uuid()
    console.log('file :>> ', file);
    console.log('request length :>> ', x);
    let blobSize = 0
    for (let y = 0; y<x; y++) {
      let blobLength = file.size > (blobSize + chunkSize) ? (blobSize + chunkSize) : file.size
      uploadFiles(file.slice(blobSize, blobLength), `${fileId}.${file.name.split('.').pop()}`)
      blobSize = blobLength
    }
  }
  return (
    <div>
      <h1>Open Hellox World.txt</h1>
      <div className="Hello">
        {/* <button type="button" onClick={upload}>
          Open File
        </button> */}
        <input onChange={handleFileOnChange} type='file' name = 'blobFile'/>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={MainContainer} />
      </Switch>
    </Router>
  );
}

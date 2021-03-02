import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import {v4 as uuid} from 'uuid'
import http from 'axios'
const SERVER_HOST = 'http://localhost:5002'
const blobUploader = (file, blobName, options = {}) => {
  const {
    blobStartingByte = 0
  } = options
  const chunkSize = ((1024 * 1024) * 10) // 8mb
  const totalFileSize = file.size
  const u = (blobStartingByte) => {
    let blobByteLength = file.size > (blobStartingByte + chunkSize) ? (blobStartingByte + chunkSize) : file.size
    uploadFiles(file.slice(blobStartingByte, blobByteLength), blobName)
      .then(() => {
        if (blobStartingByte < file.size) {
          return u(blobByteLength)
        }
        return true
      })
  }
  const uploadFiles = (file, fileId) => {
    return new Promise((resolve, reject) => {
      const httpOptions = {
        url: `${SERVER_HOST}/upload`,
        onAbort: (err) => {
          console.log('@on abort');
          reject(err)
        },
        onError: (err) => {
          console.log('@on onError');
          reject(err)
        },
        onProgress: () => {
          console.log('@on onProgress');
        },
        onComplete: () => {
          console.log('@on onComplete');
          resolve()
        },
      }
    
      const uploadToServer = (file, options) => {
        const request = new XMLHttpRequest()
        const formData = new FormData()
        formData.append('blob', file, file.name)
        request.open("POST", options.url, true)
        request.setRequestHeader('X-File-Id', fileId)
        request.setRequestHeader('X-File-Size', totalFileSize)
    
        request.onload = () => options.onComplete();
    
        request.upload.onprogress = () => options.onProgress();
    
        request.onerror = (e) => options.onError(e);
        
        request.onabort = (e) => options.onAbort(e);
    
        request.ontimeout = (e) => options.onError(e);
        
        request.send(formData);
      }
      uploadToServer(file, httpOptions)
    })
  }
  u(blobStartingByte)
}
const MainContainer = () => {
  const [uploadedFile, setUploadedFile] = useState({})
  // const inputFile = useRef(null)
  const handleFileOnChange = async (ev) => {
    setUploadedFile(ev.target.files[0])
    const fileId = uuid()
    return;
    blobUploader(uploadedFile, `${fileId}.${uploadedFile.name.split('.').pop()}`)
  }

const checkBlobStatus = () => {
  return http({
    baseURL: SERVER_HOST,
    url: `/status?fileId=${`e496d1c1-a7c5-4d62-ad73-02e9f01120cc.mp4`}`,
    method: "GET"
  })
  // .then((response) => response.json())
  .then((response) => {
    console.log('data :>> ', response.data);
    blobUploader(uploadedFile, `e496d1c1-a7c5-4d62-ad73-02e9f01120cc.mp4`, {
      blobStartingByte: response.data.totalBytesUploaded
    })
  })
}
  return (
    <div>
      <h1>Open Hellox World.txt</h1>
      <div className="Hello">
        {/* <button type="button" onClick={upload}>
          Open File
        </button> */}
        <input onChange={handleFileOnChange} type='file' name = 'blobFile'/>
        <button onClick={checkBlobStatus}>Blob Status</button>
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

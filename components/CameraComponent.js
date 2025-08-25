import React, { useRef, useState } from 'react';
import Camera from 'react-camera-pro'; // Ensure this is the correct package and import
import { storage } from '../config/firebase';
import { ref, uploadString } from 'firebase/storage';

const CameraComponent = () => {
  const camera = useRef(null);
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [error, setError] = useState(null);

  // Capture function to take a photo and upload it
  const capture = async () => {
    try {
      if (!camera.current) {
        throw new Error('Camera is not initialized');
      }

      const imageSrc = await camera.current.takePhoto(); // Ensure this returns a Promise
      if (imageSrc) {
        const storageRef = ref(storage, 'images/' + Date.now() + '.jpg');
        await uploadString(storageRef, imageSrc, 'data_url');
        alert('Image uploaded successfully!');
      } else {
        throw new Error('Failed to capture image');
      }
    } catch (error) {
      console.error('Capture failed:', error);
      setError('Failed to capture or upload the image.');
    }
  };

  return (
    <div>
      <h2>Camera Component</h2> {/* Displays the title */}
      <Camera
        ref={camera}
        aspectRatio={16 / 9}
        numberOfCamerasCallback={setNumberOfCameras}
      />
      <button onClick={capture}>Capture and Upload</button>
      {numberOfCameras === 0 && <p>No camera found</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default CameraComponent;

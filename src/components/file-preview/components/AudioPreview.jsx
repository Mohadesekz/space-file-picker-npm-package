import React, { useState } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import './Scss/AudioPlayer.scss';
import Spinner from '../../loading';

const AudioPreview = ({ fileDetails, checkToken }) => {
  const [details, setDetails] = useState(fileDetails);
  const [error, setError] = useState(false);

  const handleError = async event => {
    setDetails(null);
    const response = await checkToken(details);
    if (response) {
      setDetails(response);
    } else {
      setError(true);
    }
  };

  return (
    <div className="audio-container">
      {error ? (
        <div className="message-container">
          <h1> خطایی در بارگذاری به وجود آمده است. </h1>
        </div>
      ) : fileDetails ? (
        <AudioPlayer
          autoPlay={false}
          showSkipControls={false}
          src={fileDetails.itemSource}
          onPlayError={handleError}
          defaultDuration="بارگذاری..."
        />
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default React.memo(AudioPreview);

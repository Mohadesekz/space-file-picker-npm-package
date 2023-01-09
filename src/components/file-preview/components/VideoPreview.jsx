import React, { useState } from 'react';
import {
  Player,
  BigPlayButton,
  LoadingSpinner,
  ControlBar,
  ReplayControl,
  ForwardControl,
  PlaybackRateMenuButton,
} from 'video-react';
import Spinner from '../../loading';
import './Scss/VideoPreview.scss';

const VideoPreview = ({ fileDetails, checkToken }) => {
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
    <div className={`video-container ${error ? 'error' : ''}`}>
      {error ? (
        <div className="message-container">
          <h1> خطایی در بارگذاری به وجود آمده است. </h1>
        </div>
      ) : details ? (
        <Player
          autoPlay
          aspectRatio="16:9"
          src={details.itemSource}
          onEnded={() => {}}
          onError={handleError}
          onCanPlay={() => {}}
        >
          <LoadingSpinner />
          <BigPlayButton position="center" />
          <ControlBar>
            <PlaybackRateMenuButton rates={[5, 2, 1, 0.5, 0.1]} order={4.1} />
            <ReplayControl seconds={10} order={4.2} />
            <ForwardControl seconds={10} order={4.3} />
          </ControlBar>
        </Player>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default React.memo(VideoPreview);

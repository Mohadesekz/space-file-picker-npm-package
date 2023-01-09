import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Player,
  BigPlayButton,
  LoadingSpinner,
  ControlBar,
  ReplayControl,
  ForwardControl,
  PlaybackRateMenuButton,
  //@ts-ignore
} from 'video-react';
import Manifest from '../manifest';
import 'video-react/dist/video-react.css';
import alertSvg from '../assets/icons/alert.svg';
import { Button, Intent } from '@blueprintjs/core';
import Spinner from '../components/loading';
import '../stylesheet/publicVideo.scss';

const PublicVideo = () => {
  const params = new URLSearchParams(window.location.search);
  const { videoHash } = useParams<{ videoHash: string }>();
  const [spinner, setSpinner] = useState(true);
  const [error, setError] = useState(false);

  const reloadVideo = () => {
    setError(false);
  };
  const handleError = () => {
    setError(true);
  };
  const canPlay = () => {
    setSpinner(false);
  };

  if (error || !videoHash) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
        className="error-boundry"
      >
        <img src={alertSvg} alt="alertSvg" style={{ width: '175px', height: '175px' }} />
        <p
          style={{
            textAlign: 'center',
            color: '#546e7a',
            fontSize: '32px',
            letterSpacing: '-1px',
          }}
        >
          خطایی در بارگذاری ویدیو به وجود آمده است
        </p>
        <Button intent={Intent.PRIMARY} onClick={reloadVideo}>
          بارگذاری مجدد
        </Button>
      </div>
    );
  }

  return (
    <div
      className="podspace-video-player video-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: error ? '#FFF' : '#000',
      }}
    >
      {spinner ? (
        <div
          className="spinner-container"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: 1,
            background: '#000000d6',
          }}
        >
          <Spinner />
        </div>
      ) : null}
      <Player
        autoPlay={params.get('autoPlay') === 'true'}
        onEnded={() => {}}
        onError={handleError}
        onCanPlay={canPlay}
        muted
        style={{ width: '100%', height: '100%' }}
      >
        <source src={`${Manifest.server.api.address}files/${videoHash}`} type="video/mp4" />
        <source src={`${Manifest.server.api.address}files/${videoHash}`} type="video/webm" />
        <source src={`${Manifest.server.api.address}files/${videoHash}`} type="video/ogg" />
        <LoadingSpinner />
        <BigPlayButton position="center" />
        <ControlBar>
          <PlaybackRateMenuButton rates={[5, 2, 1, 0.5, 0.1]} order={4.1} />
          <ReplayControl seconds={10} order={4.2} />
          <ForwardControl seconds={10} order={4.3} />
        </ControlBar>
      </Player>
    </div>
  );
};

export default React.memo(PublicVideo);

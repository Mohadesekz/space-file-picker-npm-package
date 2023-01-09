import React, { useEffect, useReducer, useState } from 'react';
import './index.scss';
import { Overlay, Icon } from '@blueprintjs/core';
import {
  Player,
  BigPlayButton,
  LoadingSpinner,
  ControlBar,
  ReplayControl,
  ForwardControl,
  PlaybackRateMenuButton,
} from 'video-react';
import Manifest from '../../../../manifest';
import '../../../../../node_modules/video-react/dist/video-react.css';
import { refreshToken } from './../../../../helpers/refreshToken';
import { newFetch } from 'helpers';
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_VIDEO':
      return {
        ...state,
        listIndex: action.listIndex,
      };
    case 'NEXT_VIDEO':
      return { ...state, listIndex: ++state.listIndex };
    case 'RESET_PLAYER':
      return { ...state, listIndex: action.value };
    case 'PREV_VIDEO':
      return { ...state, listIndex: --state.listIndex };
    case 'DISPLAY_LIST':
      return { ...state, displayList: !state.displayList };
    default:
  }
};

const VideoPlayer = props => {
  const initialState = {
    listIndex: -1,
    displayList: false,
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  const [dlLink, setDlLink] = useState();

  const prevVideo = () => {
    if (state.listIndex > 0) {
      dispatch({
        type: 'PREV_VIDEO',
      });
    }
  };
  const nextVideo = () => {
    if (state.listIndex < props.list.length - 1) {
      dispatch({
        type: 'NEXT_VIDEO',
      });
    }
  };

  const renewToken = async () => {
    if (!window.location.pathname.startsWith('/public')) {
      await refreshToken();
    }
    dispatch({
      type: 'SET_VIDEO',
      listIndex: props.startIndex,
    });
  };

  const getDownloadLink = (hash, timestamp) => {
    return new Promise(async resolve => {
      const downloadLink = await newFetch(
        encodeURI(`files/${hash}/link?expiration=${timestamp}`),
        'GET',
      );
      if (downloadLink && downloadLink.downloadLink) {
        setDlLink(`${Manifest.server.api.address}files/d/${downloadLink.downloadLink}`);
      } else {
        setDlLink(`${Manifest.server.api.address}files/${hash}?Authorization=${token}${password}`);
      }
      setTimeout(() => {
        resolve();
      }, 10);
    });
  };
  useEffect(_ => {
    if (props.list) {
      renewToken();
    }
    return () => {};
  }, []);

  const video = state.listIndex !== -1 && props.list[state.listIndex];
  const name = video
    ? video.name + (video.extension ? '.' + video.extension : '')
    : '__WITHOUT_NAME__';
  const token = localStorage.getItem('access_token');
  const password = props.password;

  useEffect(() => {
    if (video) {
      if (props.public) {
        setDlLink(
          `${Manifest.server.api.address}files/${video.hash}?Authorization=${token}${password}`,
        );
      } else {
        const date = +new Date();
        const timestamp = date + 59 * 60 * 1000;
        getDownloadLink(video.hash, timestamp);
      }
    }
  }, [video]);

  return (
    <Overlay
      className="player-video-slider"
      isOpen={true}
      onClose={props.close}
      transitionDuration={200}
    >
      <Icon icon="cross" iconSize={50} color="#fff" onClick={props.close} />
      {props.list && props.list.length > 1 ? (
        <div className={`prev-icon${state.listIndex > 0 ? '' : ' disabled'}`} onClick={prevVideo}>
          <Icon icon="chevron-right" iconSize={50} color="#fff" />
        </div>
      ) : null}
      {props.list && props.list.length > 1 ? (
        <div
          className={`next-icon${state.listIndex < props.list.length - 1 ? '' : ' disabled'}`}
          onClick={nextVideo}
        >
          <Icon icon="chevron-left" iconSize={50} color="#fff" />
        </div>
      ) : null}
      <div className="player-video-container">
        <div className="player-video">
          {video ? (
            <Player
              autoPlay
              aspectRatio="16:9"
              // src={`${Manifest.server.api.address}files/${video.hash}?Authorization=${token}${password}`}
              src={dlLink}
              onEnded={() => {}}
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
          ) : null}
        </div>
      </div>

      {video ? (
        <div className="player-video-text">
          <div className="player-content-wrapper">
            <p className="player-name">{name}</p>
            <p className="player-size">{video.size_}</p>
          </div>
        </div>
      ) : null}
    </Overlay>
  );
};

export default VideoPlayer;

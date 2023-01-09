import React, { useEffect, useReducer, useState } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import Manifest from '../../../manifest';
import { Icon } from '@blueprintjs/core';
import Draggable from 'react-draggable';
import { Util } from './../../../helpers';
import './index.scss';
import { refreshToken } from './../../../helpers/refreshToken';
import { newFetch } from './../../../helpers';
declare interface IProps {
  list: any[];
  startHash: string;
  password: string;
  onClose: () => void;
  public: boolean;
}

const reducer = (
  state: {
    listIndex: number;
    displayList: boolean;
    minimize: boolean;
    loadTrack: boolean;
  },
  action: any,
) => {
  switch (action.type) {
    case 'SET_AUDIO':
      return {
        ...state,
        listIndex: action.listIndex,
        loadTrack: false,
      };
    case 'NEXT_AUDIO':
      return { ...state, listIndex: ++state.listIndex, loadTrack: false };
    case 'RESET_PLAYER':
      return { ...state, listIndex: action.value, loadTrack: false };
    case 'PREV_AUDIO':
      return { ...state, listIndex: --state.listIndex, loadTrack: false };
    case 'MINIMIZE_PLAYER':
      return { ...state, minimize: action.value };
    case 'DISPLAY_LIST':
      return { ...state, displayList: !state.displayList };
    case 'CAN_PAY_NEXT':
      return { ...state, loadTrack: true };
    default:
      return state;
  }
};

const AudioPlayerTool = (props: IProps) => {
  const mobileAndTabletCheck = Util.mobileAndTabletCheck();
  const initialState = {
    listIndex: -1,
    displayList: false,
    minimize: false,
    loadTrack: false,
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  const [dlLink, setDlLink] = useState<string>();

  const renewToken = async () => {
    if (!window.location.pathname.startsWith('/public')) {
      await refreshToken();
    }
    const startIndex = props.list.findIndex(item => item.hash === props.startHash);
    dispatch({
      type: 'SET_AUDIO',
      listIndex: startIndex,
    });
  };
  useEffect(() => {
    if (props.list && props.startHash) {
      renewToken();
    }
    return () => {};
  }, []);

  const playNext = () => {
    if (state.listIndex < props.list.length - 1 && state.loadTrack) {
      dispatch({
        type: 'NEXT_AUDIO',
      });
    }
  };
  const playPrev = () => {
    if (state.listIndex > 0 && state.loadTrack) {
      dispatch({
        type: 'PREV_AUDIO',
      });
    }
  };

  const changeTrack = (trackIndex: number) => {
    if (state.loadTrack) {
      dispatch({
        type: 'SET_AUDIO',
        listIndex: trackIndex,
        canPlay: false,
      });
    }
  };

  const displayList = () => {
    dispatch({
      type: 'DISPLAY_LIST',
    });
  };

  const handleEnd = () => {
    if (state.listIndex > 0) {
      playPrev();
    } else if (state.listIndex === 0) {
      dispatch({
        type: 'RESET_PLAYER',
        value: props.list.length - 1,
      });
    }
  };
  const canPlayNext = () => {
    dispatch({
      type: 'CAN_PAY_NEXT',
    });
  };

  const token = localStorage.getItem('access_token');
  const audio = props.list[state.listIndex];
  const password = props.password;

  const getDownloadLink = (hash: any, timestamp: any) => {
    return new Promise<void>(async resolve => {
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

  useEffect(() => {
    if (audio) {
      if (props.public) {
        setDlLink(
          `${Manifest.server.api.address}files/${audio.hash}?Authorization=${token}${password}`,
        );
      } else {
        const date = +new Date();
        const timestamp = date + 59 * 60 * 1000;
        getDownloadLink(audio.hash, timestamp);
      }
    }
  }, [audio]);
  return (
    <>
      <Draggable
        handle={mobileAndTabletCheck ? '.disable-dragging' : '.audio-player'}
        bounds="parent"
      >
        <div className={`audio-player ${state.minimize ? 'minimize' : ''}`}>
          {props.list && props.list.length > 1 ? (
            <ul className={`play-list ${state.displayList ? 'active' : ''}`}>
              {props.list.map((aud, index) => (
                <li key={aud.hash} className="track" onClick={() => changeTrack(index)}>
                  {index === state.listIndex && <Icon icon="pause" iconSize={12} />}
                  <p title={aud.name}>{aud.name}</p>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="player-container">
            {audio ? (
              <div className="audio-name">
                <h3 title={audio.name}>{audio.name}</h3>
                <button
                  onClick={() => {
                    dispatch({
                      type: 'MINIMIZE_PLAYER',
                      value: true,
                    });
                  }}
                  className="audio-player-close"
                >
                  <Icon icon="minimize" iconSize={14} />
                </button>
                {props.list && props.list.length > 1 ? (
                  <button title={'نمایش لیست'} onClick={displayList} className="audio-player-close">
                    <Icon
                      icon={state.displayList ? 'double-chevron-down' : 'double-chevron-up'}
                      iconSize={14}
                    />
                  </button>
                ) : null}
                <button onClick={props.onClose} className="audio-player-close">
                  <Icon icon="small-cross" iconSize={14} />
                </button>
              </div>
            ) : null}
            {props.list && audio ? (
              <AudioPlayer
                autoPlay
                onCanPlay={canPlayNext}
                showSkipControls={true}
                src={dlLink}
                onClickNext={playNext}
                onEnded={handleEnd}
                onPlayError={() => {}}
                onClickPrevious={playPrev}
                defaultDuration="بارگذاری..."
                className={state.minimize ? 'minimize' : ''}
              />
            ) : null}
          </div>
          {/* <Icon icon="volume-up" iconSize={16} /> */}
        </div>
      </Draggable>
      {state.minimize && (
        <button
          onClick={() => {
            dispatch({
              type: 'MINIMIZE_PLAYER',
              value: false,
            });
          }}
          className="minimize-audio-player"
        >
          <Icon icon="volume-up" iconSize={20} />
        </button>
      )}
    </>
  );
};

export default AudioPlayerTool;

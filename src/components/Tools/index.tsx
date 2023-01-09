import React, { useEffect, useState } from 'react';
import { closeAudioPlayer } from 'components/files-list/actions/files';
import { connect } from 'react-redux';
import AudioPlayerTool from './audio-player';

const Tools = (props: any) => {
  const [firstRender, setFirderRender] = useState(true);
  useEffect(() => {
    setFirderRender(false);
    if (!firstRender) {
      if (props.type === 'AUDIO') {
        if (document.getElementsByClassName('file-list-container').length > 0) {
          document
            .getElementsByClassName('file-list-container')[0]
            .classList.add('audio-is-playing');
        } else if (document.getElementsByClassName('grid').length > 0) {
          document.getElementsByClassName('grid')[1].classList.add('audio-is-playing');
        }
      } else {
        if (document.getElementsByClassName('file-list-container').length > 0) {
          document
            .getElementsByClassName('file-list-container')[0]
            .classList.remove('audio-is-playing');
        } else if (document.getElementsByClassName('grid').length > 0) {
          document.getElementsByClassName('grid')[1].classList.remove('audio-is-playing');
        }
      }
    }
  }, [props]);
  return (
    <>
      {props.type && props.type === 'AUDIO' ? (
        <AudioPlayerTool
          list={props.list}
          onClose={props.onCloseAudioPlayer}
          startHash={props.startHash}
          password={props.password}
          public={window.location.pathname.startsWith('/public') ? true : false}
        />
      ) : null}
    </>
  );
};

export const mapStateToProps = (state: any) => ({
  ...state.files.list.playList,
});

export const mapDispatchToProps = (dispatch: any) => ({
  onCloseAudioPlayer() {
    dispatch(closeAudioPlayer());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Tools);

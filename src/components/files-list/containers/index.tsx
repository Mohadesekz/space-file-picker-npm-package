import React from 'react';
import ListViewTable from '../components/list-view';
import GridView from '../components/grid-view';
import lodashFilter from 'lodash/filter';
import { Alert, Intent } from '@blueprintjs/core';
import Rename from '../components/rename';
import Share from '../components/share';
import CreateFolder from '../components/newFolder';
import ImageSlider from '../components/image-slider/imageSlider';
import VideoPlayer from '../components/player-video';
import PdfReader from '../components/pdf-reader';
import Download from './download';
import { connect } from 'react-redux';
import FilesListFunctions from './filesListFunctions';
import { mapStateToProps, mapDispatchToProps } from './filesListFunctions';
import { Overlay, Icon, Button } from '@blueprintjs/core';
import './index.scss';
class FilesListContainer extends FilesListFunctions {
  componentDidMount() {
    this.OnReceiveDataFlag(true);
    window.parent.postMessage(
      {
        title: 'ready-to-recieve',
        message: 'ready-to-recieve',
      },
      '*',
    );
  }

  sendMessage = () => {
    if (this.props.itemInfo && this.props.itemInfo.hash) {
      // console.log(this.props.itemInfo.data);
      window.parent.postMessage(
        {
          title: 'selected_hashes',
          message: this.props.itemInfo.hash,
        },
        '*',
      );
    }
  };

  render() {
    return (
      <div
        className={`files ${this.props.publicFolderNeedPassword ? 'password-required' : ''} ${
          this.props.publicFolderForbidden ? 'forbidden' : ''
        }`}
        ref={this.filesRef as any}
        //@ts-ignore
        onContextMenu={this.state.disableContext ? null : this.baseContextMenu(null)}
      >
        <div style={{ width: '180px', height: '80px', backgroundColor: 'pink' }}>
          {this.props.singleOrBatch ? 'batch' : 'single'}
          <br />
          {this.props.canUpload ? 'you can upload' : 'you can not upload'}
          {this.props.folderAllowed ? 'you can choose folder' : 'you can not choose folder'}
        </div>
        {this.state.isIFrameOpen && (
          <div style={{ display: 'flex', alignItems: 'end', flexDirection: 'column' }}>
            <Button
              disabled={this.props.itemInfo.data < 1 || this.state.folderAllowedError}
              onClick={this.sendMessage}
              intent={Intent.PRIMARY}
              className={'submit-button'}
              title={this.state.folderAllowedError ? 'شما مجاز به انتخاب فولدر نیستید.' : ''}
            >
              تایید
            </Button>
          </div>
        )}
        {this.state.downloadDetails ? (
          <Download
            fileDetails={this.state.downloadDetails}
            publicFolderPassword={this.props.publicFolderPassword}
            onEndDownload={() => {
              this.setState({ downloadDetails: null });
            }}
            unSelectAll={this.props.onUnSelectAll}
          />
        ) : null}
        {this.props.public &&
          !this.props.publicFolderPassword &&
          this.props.publicFolderNeedPassword &&
          this.renderHandleError()}
        {this.props.public && this.props.publicFolderForbidden && this.renderHandleForbidden()}
        {!this.props.publicFolderNeedPassword &&
          !this.props.publicFolderForbidden &&
          Object.is(this.props.view, 'list') && (
            <ListViewTable
              recents={
                this.props.filter.selected === 'mybox' && !this.props.public
                  ? this.props.recents.recents
                  : {}
              }
              error={this.props.hasError}
              hash={this.props.hash}
              owner={this.props.owner}
              data={this.props.data[this.props.filter.selected]}
              size={this.props.size[this.props.filter.selected]}
              selectedCount={this.props.selectedCount}
              filter={this.props.filter.selected}
              uploadBox={this.props.uploadBox}
              onSelectItem={
                // this.props.public ? () => {} : this.props.onSelectItem
                this.props.onSelectItem
              }
              onUnSelectItem={
                // this.props.public ? () => {} : this.props.onUnSelectItem(this.props.filter.selected)
                this.props.onUnSelectItem(this.props.filter.selected)
              }
              onToggleItem={
                // this.props.public ? () => {} : this.props.onToggleItem(this.props.filter.selected)
                this.props.onToggleItem(this.props.filter.selected)
              }
              onSelectAllItems={
                // this.props.public
                //   ? () => {}
                //   : this.props.onSelectAllItems(
                //       this.props.filter.selected,
                //       this.props.data[this.props.filter.selected],
                //     )
                this.props.onSelectAllItems(
                  this.props.filter.selected,
                  this.props.data[this.props.filter.selected],
                )
              }
              onUnSelectAll={
                // this.props.public ? () => {} : () => this.props.onUnSelectAll()
                () => this.props.onUnSelectAll()
              }
              onImageItem={this.handleImageSlider}
              onAudioItem={this.handlePlayerMusic}
              onVideoItem={this.handleVideoPlayer}
              onPdfReader={this.handlePdfReader}
              showRecents={this.state.showRecents}
              onSaveRecentMode={this.onSaveRecentMode}
              loading={this.props.isLoading[this.props.filter.selected]}
              body={this.props.body}
              baseContextMenu={this.baseContextMenu}
              recentContextMenu={this.recentContextMenu}
              onLoadMore={this.onLoadMore}
              onRefresh={this.onRefresh}
              breadcrumb={this.props.breadcrumb}
              hasNewData={this.props.hasNewData}
              public={this.props.public}
              getFileDetail={this.getFileDetail}
              navigation={this.props.history}
              singleOrBatch={this.props.singleOrBatch}
              canUpload={this.props.canUpload}
            />
          )}
        {!this.props.publicFolderNeedPassword &&
          !this.props.publicFolderForbidden &&
          Object.is(this.props.view, 'grid') && (
            <GridView
              recents={
                this.props.filter.selected === 'mybox' && !this.props.public
                  ? this.props.recents.recents
                  : {}
              }
              error={this.props.hasError}
              hash={this.props.hash}
              owner={this.props.owner}
              data={this.props.data[this.props.filter.selected]}
              size={this.props.size[this.props.filter.selected]}
              selectedCount={this.props.selectedCount}
              uploadBox={this.props.uploadBox}
              filter={this.props.filter.selected}
              onSelectItem={
                // this.props.public ? () => {} : this.props.onSelectItem
                this.props.onSelectItem
              }
              onUnSelectItem={
                // this.props.public ? () => {} : this.props.onUnSelectItem(this.props.filter.selected)
                this.props.onUnSelectItem(this.props.filter.selected)
              }
              onToggleItem={
                // this.props.public ? () => {} : this.props.onToggleItem(this.props.filter.selected)
                this.props.onToggleItem(this.props.filter.selected)
              }
              onSelectAllItems={
                // this.props.public
                //   ? () => {}
                //   : this.props.onSelectAllItems(
                //       this.props.filter.selected,
                //       this.props.data[this.props.filter.selected],
                //     )
                this.props.onSelectAllItems(
                  this.props.filter.selected,
                  this.props.data[this.props.filter.selected],
                )
              }
              onUnSelectAll={
                // this.props.public ? () => {} : () => this.props.onUnSelectAll()
                () => this.props.onUnSelectAll()
              }
              onImageItem={this.handleImageSlider}
              onAudioItem={this.handlePlayerMusic}
              onVideoItem={this.handleVideoPlayer}
              onPdfReader={this.handlePdfReader}
              showRecents={this.state.showRecents}
              onSaveRecentMode={this.onSaveRecentMode}
              loading={this.props.isLoading[this.props.filter.selected]}
              baseContextMenu={this.baseContextMenu}
              recentContextMenu={this.recentContextMenu}
              onLoadMore={this.onLoadMore}
              container={this.filesRef}
              body={this.props.body}
              onRefresh={this.onRefresh}
              breadcrumb={this.props.breadcrumb}
              hasNewData={this.props.hasNewData}
              public={this.props.public}
              getFileDetail={this.getFileDetail}
              navigation={this.props.history}
              singleOrBatch={this.props.singleOrBatch}
              canUpload={this.props.canUpload}
            />
          )}
        <Rename
          onChangeName={this.onChangeName}
          ref={this.renameRef as any}
          onEnd={this.props.onGetRecents}
          item={lodashFilter(this.props.data[this.props.filter.selected], item => item.isSelected)}
        />
        {this.state.shareItem ? (
          <Share
            shortLink={this.props.onShortlink}
            onChangePassword={this.props.onChangePassword}
            onShare={this.props.onShare}
            onRefresh={this.onRefresh}
            OnRemoveShare={this.props.OnRemoveShare}
            onRefreshRecent={this.props.onGetRecents}
            desableSetPassword={this.props.disable_set_password}
            onEnd={() => this.setState({ disableContext: false, shareItem: null })}
            fileDetails={this.state.shareItem}
            shares={this.props.shares}
          />
        ) : null}
        <CreateFolder
          onCreate={this.props.onCreateFolder(this.props.hash, this.onRefresh)}
          ref={this.newFolderRef as any}
        />
        <Alert
          cancelButtonText="لغو"
          confirmButtonText="تایید"
          intent={Intent.PRIMARY}
          isOpen={this.state.isConfirmOpen}
          onCancel={() => {
            this.setState({ disableContext: false, isConfirmOpen: false });
          }}
          onClose={() => {
            this.setState({ disableContext: false, isConfirmOpen: false });
          }}
          onConfirm={() => {
            this.setState({ disableContext: false, isConfirmOpen: false });
            this.state.confirmFunc();
          }}
        >
          <p>{this.state.confirmText}</p>
        </Alert>
        {this.state.imageSlider.open ? (
          <ImageSlider
            images={this.state.imageSlider.images}
            startIndex={this.state.imageSlider.startIndex}
            close={this.closeImageSlider}
            public={this.props.public}
            password={this.state.imageSlider.password}
          />
        ) : null}
        {this.state.VideoPlayer.open ? (
          <VideoPlayer
            list={this.state.VideoPlayer.list}
            startIndex={this.state.VideoPlayer.startIndex}
            close={this.closeVideoPlayer}
            public={this.props.public}
            password={this.state.VideoPlayer.password}
          />
        ) : null}
        {this.state.pdfReader.open ? (
          <Overlay
            className="pdf-reader"
            isOpen={true}
            onClose={this.props.close}
            transitionDuration={200}
          >
            <Icon icon="cross" iconSize={30} color="#fff" onClick={this.closePdfReader} />
            <PdfReader
              pdfSource={this.state.pdfReader.data.itemSource}
              pdfHash={this.state.pdfReader.data.hash}
              pageWidth={window.innerWidth > 768 ? 768 : window.innerWidth - 50}
              password={this.state.pdfReader.password}
              public={this.props.public}
            />
          </Overlay>
        ) : null}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(
  FilesListContainer,
);

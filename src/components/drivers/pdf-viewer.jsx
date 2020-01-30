// Copyright (c) 2017 PlanGrid, Inc.

import React from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import { PDFJS } from 'pdfjs-dist/build/pdf.combined';
import classnames from 'classnames';
import 'pdfjs-dist/web/compatibility';

PDFJS.disableWorker = true;
const INCREASE_PERCENTAGE = 0.2;
const DEFAULT_SCALE = 1.0;

export class PDFPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    if (this.props.disableVisibilityCheck) this.fetchAndRenderPage();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.disableVisibilityCheck) {
      if (prevProps.zoom !== this.props.zoom) this.fetchAndRenderPage();
      return;
    }

    // we want to render/re-render in two scenarias
    // user scrolls to the pdf
    // user zooms in
    if (
      prevState.isVisible === this.state.isVisible &&
      prevProps.zoom === this.props.zoom &&
      prevProps.containerWidth === this.props.containerWidth
    )
      return;
    if (this.state.isVisible) this.fetchAndRenderPage();
  }

  onChange(isVisible) {
    if (isVisible) this.setState({ isVisible });
  }

  fetchAndRenderPage() {
    const { pdf, index } = this.props;
    pdf.getPage(index).then(this.renderPage.bind(this));
  }

  renderPage(page) {
    const { containerWidth, zoom } = this.props;
    const calculatedScale =
      containerWidth / page.getViewport(DEFAULT_SCALE).width;
    const scale =
      calculatedScale > DEFAULT_SCALE ? DEFAULT_SCALE : calculatedScale;
    const viewport = page.getViewport(scale + zoom);
    const { width, height } = viewport;

    const context = this.canvas.getContext('2d');
    this.canvas.width = width;
    this.canvas.height = height;

    page.render({
      canvasContext: context,
      viewport
    });
  }

  render() {
    const { index, customStyles } = this.props;
    return (
      <div
        key={`page-${index}`}
        className={classnames('pdf-canvas', customStyles.page)}
      >
        {this.props.disableVisibilityCheck ? (
          <canvas ref={node => (this.canvas = node)} width="670" height="870" />
        ) : (
          <VisibilitySensor onChange={this.onChange} partialVisibility>
            <canvas
              ref={node => (this.canvas = node)}
              width="670"
              height="870"
            />
          </VisibilitySensor>
        )}
      </div>
    );
  }
}

export default class PDFDriver extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pdf: null,
      zoom: this.props.initialZoom || 0,
      percent: 0
    };

    this.increaseZoom = this.increaseZoom.bind(this);
    this.reduceZoom = this.reduceZoom.bind(this);
    this.resetZoom = this.resetZoom.bind(this);
  }

  componentDidMount() {
    const { filePath } = this.props;
    PDFJS.getDocument(
      filePath,
      null,
      null,
      this.progressCallback.bind(this)
    ).then(pdf => {
      const containerWidth = this.container.offsetWidth;
      this.setState({ pdf, containerWidth });
    });
  }

  setZoom(zoom) {
    this.setState({
      zoom
    });
  }

  progressCallback(progress) {
    const percent = ((progress.loaded / progress.total) * 100).toFixed();
    this.setState({ percent });
  }

  reduceZoom() {
    if (this.state.zoom < 0) {
      return;
    }
    this.setZoom(this.state.zoom - 1);
  }

  increaseZoom() {
    this.setZoom(this.state.zoom + 1);
  }

  resetZoom() {
    this.setZoom(0);
  }

  renderPages(preview) {
    const { pdf, containerWidth, zoom } = this.state;
    if (!pdf) return null;
    const pages = Array.apply(null, { length: pdf.numPages });

    if (preview) {
      return (
        <PDFPage
          index={1}
          pdf={pdf}
          containerWidth={containerWidth}
          zoom={zoom * INCREASE_PERCENTAGE}
          disableVisibilityCheck={this.props.disableVisibilityCheck}
          preview={preview}
          {...this.props}
        />
      );
    }

    const pagesComp = [];
    pagesComp.push(<div className="page-spacer"></div>);
    pages.forEach((v, i) => {
      pagesComp.push(
        <PDFPage
          index={i + 1}
          pdf={pdf}
          containerWidth={containerWidth}
          zoom={zoom * INCREASE_PERCENTAGE}
          disableVisibilityCheck={this.props.disableVisibilityCheck}
          {...this.props}
        />
      );
    });
    pagesComp.push(<div className="page-spacer"></div>);

    return pagesComp;
  }

  renderLoading() {
    if (this.state.pdf) return null;
    return <div className="pdf-loading">Loading ({this.state.percent}%)</div>;
  }

  render() {
    const { preview, customStyles } = this.props;
    return (
      <div
        className={classnames(
          'pdf-viewer-container',
          customStyles.viewerContainer
        )}
      >
        <div
          className={classnames('pdf-viewer', customStyles.viewer)}
          ref={node => (this.container = node)}
        >
          {!preview && (
            <div
              className={classnames(
                'pdf-controlls-container',
                customStyles.controlsContainer
              )}
            >
              <div
                className={classnames('view-control', customStyles.control)}
                onClick={this.resetZoom}
              >
                {this.props.zoomResetComp}
              </div>
              <div
                className={classnames('view-control', customStyles.control)}
                onClick={this.increaseZoom}
              >
                {this.props.zoomInComp}
              </div>
              <div
                className={classnames('view-control', customStyles.control)}
                onClick={this.reduceZoom}
              >
                {this.props.zoomOutComp}
              </div>
            </div>
          )}
          {this.renderLoading()}
          {this.renderPages(preview)}
        </div>
      </div>
    );
  }
}

PDFDriver.defaultProps = {
  disableVisibilityCheck: false,
  customStyles: {}
};

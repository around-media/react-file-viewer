// Copyright (c) 2017 PlanGrid, Inc.

import 'styles/main.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import FileViewer from './components/file-viewer';
import sampleHouse from '../example_files/SampleHouse.wexbim';
import solarImage from '../example_files/02-USVI-Solar.jpg';
import docx from '../example_files/SampleSpec.docx';
import doc from '../example_files/sample.doc';
import csv from '../example_files/Total_Crime.csv';
import mp4 from '../example_files/small.mp4';
import xlsx from '../example_files/SimpleSpreadsheet.xlsx';
import photo360 from '../example_files/360photo.jpg';
import avi from '../example_files/drop.avi';
import webm from '../example_files/small.webm';
import mov from '../example_files/step.mov';
import mp3 from '../example_files/sample.mp3';
import rtf from '../example_files/sample.rtf';
import pdf from '../example_files/sample.pdf';
import pdf2 from '../example_files/sample2.pdf';

ReactDOM.render(
  <div style={{ width: '385px', height: '310px' }}>
    <FileViewer
      fileType="pdf"
      filePath={pdf2}
      initialZoom={0}
      zoomInComp={<button>ZOOM IN</button>}
      zoomOutComp={<button>ZOOM OUT</button>}
      zoomResetComp={<button>ZOOM RESET</button>}
      preview={true}
    />
  </div>,
  window.document.getElementById('app')
);

import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  LinearProgress,
  TextField,
  InputAdornment,
} from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import { useSelector, useDispatch } from 'react-redux';

import { Check, DeviceHub, FolderOpen } from '@material-ui/icons';
import {
  SplitFixedDetails,
  splitDetailsSelector,
  selectSplitter,
  setOutputDirectory,
  setAfterPadSeconds,
  setBeforePadSeconds,
} from './splitterSlice';
import { formatMatchKey } from '../../utils/helpers';

const { ipcRenderer, remote } = require('electron');

momentDurationFormatSetup(moment);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    container: {
      maxHeight: 'calc(100vh - 319px)',
    },
    timeButton: {
      backgroundColor: '#4caf50',
      color: 'white',
    },
    progressBar: {
      minWidth: 100,
    },
    openButton: {
      marginLeft: theme.spacing(1),
    },
    extraSecondsWrapper: {
      display: 'flex',
      justifyContent: 'flex-start',
    },
    extraSeconds: {
      marginRight: theme.spacing(0.5),
      marginLeft: theme.spacing(0.5),
      maxWidth: 100,
    },
  })
);

export default function SplitterTable() {
  const dispatch = useDispatch();
  const splitDetails = useSelector(splitDetailsSelector);
  const { matchSplitStates, beforePadSeconds, afterPadSeconds, outputDirectory } = useSelector(
    selectSplitter
  );

  const classes = useStyles();

  const handleBrowse = () => {
    const { dialog } = remote;
    const WIN = remote.getCurrentWindow();
    dialog
      .showOpenDialog(WIN, {
        properties: ['openDirectory'],
      })
      .then((dialogResult) =>
        dispatch(setOutputDirectory(dialogResult.filePaths[0]))
      )
      .catch(() => console.log('error loading directory'));
  };

  return (
    <TableContainer className={classes.container}>
      <Table stickyHeader size="small" aria-label="split videos table">
        <TableHead>
          <TableRow>
            <TableCell>Match</TableCell>
            <TableCell>Source File</TableCell>
            <TableCell>
              Output Folder: ({outputDirectory})
              <Button
                className={classes.openButton}
                onClick={() => handleBrowse()}
                variant="contained"
                color="primary"
                startIcon={<FolderOpen />}
              >
                Choose Folder
              </Button>
            </TableCell>
            <TableCell>
              <div className={classes.extraSecondsWrapper}>
                <TextField
                  className={classes.extraSeconds}
                  type="number"
                  size="small"
                  defaultValue={beforePadSeconds}
                  label="Before"
                  variant="outlined"
                  onChange={(event) =>
                    dispatch(
                      setBeforePadSeconds(parseInt(event.target.value, 10))
                    )}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">s</InputAdornment>
                    ),
                  }}
                />
                <TextField
                  className={classes.extraSeconds}
                  type="number"
                  size="small"
                  defaultValue={afterPadSeconds}
                  label="After"
                  variant="outlined"
                  onChange={(event) =>
                    dispatch(
                      setAfterPadSeconds(parseInt(event.target.value, 10))
                    )}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">s</InputAdornment>
                    ),
                  }}
                />
              </div>
            </TableCell>
            <TableCell>Video Length</TableCell>
            <TableCell align="right">
              <Button
                variant="contained"
                color="primary"
                size="medium"
                endIcon={<DeviceHub />}
                onClick={() => {
                  ipcRenderer.send('split', splitDetails);
                }}
              >
                Split All
              </Button>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {splitDetails.map((splitDetail: SplitFixedDetails) => {
            const splitState = matchSplitStates[splitDetail.matchKey] || {
              matchKey: splitDetail.matchKey,
              active: false,
              finished: false,
              percent: 0,
            };

            return (
              <TableRow key={splitDetail.matchKey}>
                <TableCell component="th" scope="row">
                  {formatMatchKey(splitDetail.matchKey)}
                </TableCell>
                <TableCell>{splitDetail.inputFile}</TableCell>
                <TableCell>{`${splitDetail.outputFile}`}</TableCell>
                <TableCell>{`${beforePadSeconds}s / ${afterPadSeconds}s`}</TableCell>
                <TableCell>
                  {moment
                    .duration(splitDetail.blocks.map(b=>b.durationSeconds).reduce((prev, cur)=>prev+cur, 0), 'seconds')
                    .format()}
                </TableCell>
                <TableCell align="right">
                  {!splitState.active && !splitState.finished && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => ipcRenderer.send('split', [splitDetail])}
                    >
                      Split
                    </Button>
                  )}
                  {splitState.active && (
                    <LinearProgress
                      variant="determinate"
                      value={splitState.percent}
                      className={classes.progressBar}
                    />
                  )}
                  {splitState.finished && <Check />}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

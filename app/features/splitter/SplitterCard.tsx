import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  InputAdornment,
} from '@material-ui/core';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useDispatch, useSelector } from 'react-redux';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { FolderOpen, DeviceHub } from '@material-ui/icons';

import SplitterTable from './SplitterTable';
import {
  selectSplitter,
  setAfterPadSeconds,
  setBeforePadSeconds,
  splitDetailsSelector,
  setMatchSplitState,
} from './splitterSlice';

const { ipcRenderer, remote } = require('electron');

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    extraSecondsWrapper: {
      display: 'flex',
    },
    extraSeconds: {
      marginRight: theme.spacing(0.5),
      marginLeft: theme.spacing(0.5),
      maxWidth: 100,
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  })
);

export default function SplitterCard(): JSX.Element {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { beforePadSeconds, afterPadSeconds, activelySplitting } = useSelector(
    selectSplitter
  );
  const splitDetails = useSelector(splitDetailsSelector);

  useEffect(() => {
    ipcRenderer.on('split-progress', (event, arg) => {
      dispatch(
        setMatchSplitState({
          matchKey: arg.matchKey,
          active: true,
          finished: false,
          percent: arg.percent,
        })
      );
    });

    ipcRenderer.on('split-start', (event, arg) => {
      dispatch(
        setMatchSplitState({
          matchKey: arg.matchKey,
          active: true,
          finished: false,
          percent: 0,
        })
      );
    });

    ipcRenderer.on('split-end', (event, arg) => {
      dispatch(
        setMatchSplitState({
          matchKey: arg.matchKey,
          active: false,
          finished: true,
          percent: 100,
        })
      );
    });
  }, []);

  return (
    <Card>
      <CardContent>
        <Grid
          className={classes.root}
          container
          spacing={1}
          direction="column"
          justify="center"
          alignItems="stretch"
        >
          <Grid item lg={12}>
            <Grid
              className={classes.root}
              container
              spacing={1}
              direction="row"
            >
              <Grid item lg={4}></Grid>
            </Grid>
          </Grid>
          <Grid item lg={12}>
            <SplitterTable />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

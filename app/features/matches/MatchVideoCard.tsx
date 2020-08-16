import React, { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import ReactPlayer from 'react-player';
import { Grid } from '@material-ui/core';
import ScrubControls from './ScrubControls';

import { addFiles, selectFiles } from '../files/filesSlice';
import {
  selectMatchesState,
  setFirstMatchVideoOffset,
  setCurrentVideoSeconds,
} from './matchesSlice';

const { remote } = require('electron');

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      minWidth: 275,
    },
    noVideo: {
      display: 'flex',
      justifyContent: 'center',
    },
    player: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    controls: {},
  })
);

export default function MatchVideoCard(): JSX.Element {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { files } = useSelector(selectFiles);
  const { videoSeekSeconds } = useSelector(selectMatchesState);
  const playerRef = useRef();
  const [ready, setReady] = useState(false);

  const handleBrowse = () => {
    const { dialog } = remote;
    const WIN = remote.getCurrentWindow();
    dialog
      .showOpenDialog(WIN, {
        filters: [
          { name: 'Supported Video Types', extensions: ['mp4', 'avi', 'mkv'] },
        ],
        properties: ['openFile', 'multiSelections'],
      })
      .then((dialogResult) => dispatch(addFiles(dialogResult.filePaths)))
      .catch(() => console.log('error loading files'));
  };

  function seekPlayer(seconds: number) {
    if (ready) {
      playerRef?.current?.seekTo(seconds, 'seconds');
    }
  }

  function getPlayerSeconds(): number {
    return playerRef?.current?.getCurrentTime();
  }

  useEffect(() => {
    seekPlayer(videoSeekSeconds);
    return () => {};
  }, [videoSeekSeconds]);

  return (
    <Card className={classes.card}>
      <CardContent>
        {!files[0] && (
          <div className={classes.noVideo}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleBrowse()}
            >
              Choose a Video
            </Button>
          </div>
        )}
        {files[0] && (
          <>
            <div className={classes.player}>
              <ReactPlayer
                url={files[0]}
                ref={playerRef}
                width="100%"
                height="100%"
                controls
                onReady={() => setReady(true)}
                onProgress={(progressData) => {
                  dispatch(setCurrentVideoSeconds(progressData.playedSeconds));
                }}
              />
            </div>
            <Grid container spacing={1} justify="center" alignItems="stretch">
              <Grid item xs={12} sm={12}>
                <ScrubControls
                  handleScrub={(seconds) =>
                    seekPlayer(getPlayerSeconds() + seconds)
                  }
                />
              </Grid>
            </Grid>
          </>
        )}
      </CardContent>
    </Card>
  );
}

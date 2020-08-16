import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Fab,
  Theme,
  createStyles,
  Chip,
} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import { addFiles, selectFiles } from './filesSlice';
import FilesTable from './FilesTable';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minWidth: 275,
      minHeight: 400,
      position: 'relative',
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
    fab: {
      position: 'absolute',
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
    previewChip: {
      minWidth: 160,
      maxWidth: 210,
    },
  })
);

export default function FilesPanel(): JSX.Element {
  const dispatch = useDispatch();
  const { files } = useSelector(selectFiles);
  const classes = useStyles();

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

  return (
    <div>
      <Card className={classes.root}>
        <CardContent>
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom
          >
            Videos
          </Typography>
          {files.length > 0 ? (
            <FilesTable />
          ) : (
            <Chip color="secondary" label="No files yet" />
          )}
          <Fab
            color="primary"
            className={classes.fab}
            onClick={() => handleBrowse()}
          >
            <AddIcon />
          </Fab>
        </CardContent>
      </Card>
    </div>
  );
}

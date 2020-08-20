import React, { ChangeEvent } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import ForwardIcon from '@material-ui/icons/Forward';
import { selectMatchesState, setVideoSeekSeconds } from './matchesSlice';

momentDurationFormatSetup(moment);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    timeButton: {
      backgroundColor: '#4caf50',
      color: 'white',
      '&:hover': {
        color: '#4caf50',
      },
    },
  })
);

export default function TimestampPicker({
  timeStamp,
  onSet,
}: {
  timeStamp: number | undefined;
  onSet: (newTimestampSeconds: number) => void;
}): JSX.Element {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { currentVideoSeconds } = useSelector(selectMatchesState);

  return (
    <ButtonGroup size="small">
      <Button
        className={classes.timeButton}
        onClick={() => onSet(currentVideoSeconds)}
      >
        Set
      </Button>
      {timeStamp && (
        <Button
          className={classes.timeButton}
          endIcon={<ForwardIcon />}
          onClick={() => dispatch(setVideoSeekSeconds(timeStamp))}
        >
          {moment
            .duration(timeStamp, 'seconds')
            .format('h:mm:ss', { trim: false })}
        </Button>
      )}
    </ButtonGroup>
  );
}

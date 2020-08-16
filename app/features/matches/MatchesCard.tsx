import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { Schedule } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';
import MatchAutoComplete from './MatchAutoComplete';
import MatchesTable from './MatchesTable';

import {
  selectMatchesState,
  getMatches,
  setFirstMatch,
  setLastMatch,
  setFirstMatchVideoOffset,
} from './matchesSlice';
import { selectEvents } from '../events/eventsSlice';

import { Match } from './Match';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    content: {},
    yearSelect: {
      display: 'flex',
      justifyContent: 'center',
    },
  })
);

export default function MatchesCard(): JSX.Element {
  const classes = useStyles();
  const dispatch = useDispatch();
  const {
    matches,
    firstMatch,
    lastMatch,
    currentVideoSeconds,
    loading,
  } = useSelector(selectMatchesState);

  const { selectedEvent } = useSelector(selectEvents);

  return (
    <Card className={classes.root}>
      <CardContent className={classes.content}>
        <div className={classes.yearSelect}>
          {loading && <CircularProgress />}
          {!loading &&
            (matches.length === 0 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => dispatch(getMatches(`${selectedEvent?.key}`))}
              >
                Get Matches
              </Button>
            ) : (
              <>
                <MatchAutoComplete
                  options={matches}
                  handleChange={(newValue: Match | undefined) =>
                    dispatch(setFirstMatch(newValue))
                  }
                  selectedOption={firstMatch || matches[0]}
                  label="First Match"
                />
                <MatchAutoComplete
                  options={matches}
                  handleChange={(newValue: Match | undefined) =>
                    dispatch(setLastMatch(newValue))
                  }
                  selectedOption={lastMatch || matches.slice(-1)[0]}
                  label="Last Match"
                />
                <Button
                  startIcon={<Schedule />}
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    dispatch(setFirstMatchVideoOffset(currentVideoSeconds));
                  }}
                >
                  Set First Match Time
                </Button>
              </>
            ))}
        </div>
        {matches.length > 0 && <MatchesTable />}
      </CardContent>
    </Card>
  );
}

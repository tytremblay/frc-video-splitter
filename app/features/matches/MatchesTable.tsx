import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import Button from '@material-ui/core/Button';
import { Forward, PinDrop } from '@material-ui/icons';
import AllianceChips from './AllianceChips';
import {
  selectMatchesState,
  setVideoSeekSeconds,
  slicedMatchesSelector,
  adjustTimestamps,
} from './matchesSlice';
import { Match } from './Match';
import { formatMatchKey, getTimeStamps } from '../../utils/helpers';
import TimestampPicker from './TimestampPicker';

momentDurationFormatSetup(moment);

const useStyles = makeStyles({
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
  unknownTimeButton: {
    backgroundColor: 'white',
    color: '#4caf50',
  },
});

export default function MatchesTable() {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { firstMatchVideoOffsetSeconds, adjustedTimestamps } = useSelector(
    selectMatchesState
  );

  const slicedMatches = useSelector(slicedMatchesSelector);

  const firstMatchTime = slicedMatches[0]?.actual_time
    ? moment.unix(slicedMatches[0]?.actual_time)
    : undefined;

  return (
    <TableContainer className={classes.container}>
      <Table stickyHeader size="small" aria-label="events table">
        <TableHead>
          <TableRow>
            <TableCell>Match</TableCell>
            <TableCell align="center">Red Alliance</TableCell>
            <TableCell align="center">Blue Alliance</TableCell>
            <TableCell align="center">Match Start</TableCell>
            <TableCell align="center">Results Posted</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {slicedMatches.map((match: Match) => {
            const adjustedTimestamp = adjustedTimestamps[match.key];

            if (adjustedTimestamp)
              console.log('adjusted stamp', adjustedTimestamp);

            const timeStamps =
              adjustedTimestamps[match.key] ||
              getTimeStamps(
                match,
                firstMatchTime,
                moment.duration(firstMatchVideoOffsetSeconds, 'seconds')
              );

            return (
              <TableRow key={match.key}>
                <TableCell component="th" scope="row">
                  {formatMatchKey(match.key)}
                </TableCell>
                <TableCell align="right">
                  <AllianceChips color="red" teamKeys={match.red_alliance} />
                </TableCell>
                <TableCell align="right">
                  <AllianceChips color="blue" teamKeys={match.blue_alliance} />
                </TableCell>
                <TableCell align="center">
                  <TimestampPicker
                    timeStamp={timeStamps.startSeconds}
                    onSet={(newStart) => {
                      const newTimestamps = { ...timeStamps };
                      newTimestamps.startSeconds = newStart;
                      dispatch(adjustTimestamps(newTimestamps));
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <TimestampPicker
                    timeStamp={timeStamps.resultsSeconds}
                    onSet={(newResults) => {
                      console.log('old results: ', timeStamps.resultsSeconds);
                      console.log('new results: ', newResults);
                      const newTimestamps = { ...timeStamps };
                      newTimestamps.resultsSeconds = newResults;
                      dispatch(adjustTimestamps(newTimestamps));
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

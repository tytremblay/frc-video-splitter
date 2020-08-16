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
import { Forward } from '@material-ui/icons';
import AllianceChips from './AllianceChips';
import {
  selectMatchesState,
  setVideoSeekSeconds,
  slicedMatchesSelector,
} from './matchesSlice';
import { Match } from './Match';
import { formatMatchKey, getTimeStamps } from '../../utils/helpers';

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
});

export default function MatchesTable() {
  const dispatch = useDispatch();
  const { firstMatchVideoOffsetSeconds } = useSelector(selectMatchesState);

  const slicedMatches = useSelector(slicedMatchesSelector);

  const classes = useStyles();

  const firstMatchTime = moment.unix(slicedMatches[0]?.actual_time);

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
            const { start, results } = getTimeStamps(
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
                  <Button
                    variant="contained"
                    className={classes.timeButton}
                    endIcon={<Forward />}
                    onClick={() =>
                      dispatch(setVideoSeekSeconds(start.as('seconds')))
                    }
                  >
                    {start.format('h:mm:ss', { trim: false })}
                  </Button>
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    className={classes.timeButton}
                    endIcon={<Forward />}
                    onClick={() =>
                      dispatch(setVideoSeekSeconds(results.as('seconds')))
                    }
                  >
                    {results.format('h:mm:ss', { trim: false })}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

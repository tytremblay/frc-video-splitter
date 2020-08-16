import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { selectEvents } from './eventsSlice';
import sortBy from 'lodash/sortBy';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  container: {
    maxHeight: 600,
  },
});

export default function EventsTable() {
  const dispatch = useDispatch();
  const { events } = useSelector(selectEvents);
  const classes = useStyles();

  const sortedEvents = sortBy(events, ['week', 'name']);

  return (
    <Paper className={classes.root}>
      <TableContainer className={classes.container}>
        <Table stickyHeader className={classes.table} aria-label="events table">
          <TableHead>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell align="right">Week</TableCell>
              <TableCell align="right">Start Date</TableCell>
              <TableCell align="right">End Date</TableCell>
              <TableCell align="right">District</TableCell>
              <TableCell align="right">Event Code</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedEvents.map((event) => (
              <TableRow key={event.key}>
                <TableCell component="th" scope="row">
                  {event.name}
                </TableCell>
                <TableCell align="right">{event.week}</TableCell>
                <TableCell align="right">{event.startDate}</TableCell>
                <TableCell align="right">{event.endDate}</TableCell>
                <TableCell align="right">
                  {event.district ? event.district.displayName : 'Regional'}
                </TableCell>
                <TableCell align="right">{event.key}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

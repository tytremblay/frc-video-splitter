import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import sortBy from 'lodash/sortBy';
import { CircularProgress } from '@material-ui/core';
import {
  getEventsByYear,
  setSelectedEvent,
  setSelectedYear,
  selectEvents,
} from './eventsSlice';
import EventsSelector from './EventsSelector';

import { Event } from '../tba-api/api';
import { getMatches, clearMatches } from '../matches/matchesSlice';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minWidth: 275,
    },
    formControl: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      minWidth: 120,
    },
    yearSelect: {
      display: 'flex',
      justifyContent: 'center',
    },
  })
);

export default function EventsCard(): JSX.Element {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { events, loading, years, selectedYear, selectedEvent } = useSelector(
    selectEvents
  );
  const sortedEvents = sortBy(events, ['event_type', 'name']);

  const handleYearChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const year = event.target.value as number;
    dispatch(setSelectedEvent(null));
    dispatch(clearMatches());
    dispatch(setSelectedYear(year));
    dispatch(getEventsByYear(year));
  };

  const handleEventChange = (value: Event | null) => {
    dispatch(setSelectedEvent(value));
    dispatch(getMatches(`${value?.key}`));
  };

  useEffect(() => {
    dispatch(getEventsByYear(selectedYear));
    return () => {};
  }, [selectedYear]);

  return (
    <Card className={classes.root}>
      <CardContent>
        <div className={classes.yearSelect}>
          <Select
            label="Year"
            value={selectedYear}
            onChange={handleYearChange}
            variant="outlined"
            className={classes.formControl}
          >
            {years.map((y) => {
              return (
                <MenuItem value={y} key={y}>
                  {y}
                </MenuItem>
              );
            })}
          </Select>
          {loading ? (
            <CircularProgress />
          ) : (
            sortedEvents.length > 0 && (
              <EventsSelector
                options={sortedEvents}
                selectedOption={selectedEvent}
                handleChange={(newValue: Event | null) =>
                  handleEventChange(newValue)
                }
              />
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}

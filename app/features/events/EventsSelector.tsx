/* eslint-disable no-use-before-define */
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Event } from '../tba-api/api';

const useStyles = makeStyles(() =>
  createStyles({
    root: {},
  })
);

export default function ComboBox({
  options,
  handleChange,
  selectedOption,
}: {
  options: Event[];
  handleChange: (newValue: Event | null) => void;
  selectedOption: Event | null;
}) {
  const classes = useStyles();

  return (
    <Autocomplete
      className={classes.root}
      options={options}
      value={selectedOption}
      onChange={(event: any, newValue: Event | null) => {
        handleChange(newValue);
      }}
      getOptionLabel={(option) => `${option.name}`}
      style={{ width: 400 }}
      openOnFocus
      renderInput={(params) => (
        <TextField {...params} label="Event" variant="outlined" />
      )}
      groupBy={(option) => option.event_type_string}
    />
  );
}

/* eslint-disable no-use-before-define */
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { Chip } from '@material-ui/core';
import { Match } from './Match';
import { formatMatchKey } from '../../utils/helpers';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      minWidth: 175,
    },
    timeChip: {
      marginLeft: theme.spacing(0.5),
    },
  })
);

export default function MatchAutoComplete({
  options,
  label,
  handleChange,
  selectedOption,
}: {
  options: Match[];
  label: string;
  handleChange: (newValue: Match | undefined) => void;
  selectedOption: Match | undefined;
}) {
  const classes = useStyles();

  return (
    <Autocomplete
      className={classes.root}
      options={options}
      value={selectedOption}
      onChange={(event: any, newValue: Match | undefined) => {
        handleChange(newValue);
      }}
      getOptionLabel={(option) => formatMatchKey(option.key)}
      openOnFocus
      renderInput={(params) => (
        <TextField {...params} label={label} variant="outlined" />
      )}
      groupBy={(option) =>
        option.actual_time
          ? moment.unix(option.actual_time).format('MM-DD-Y')
          : option.comp_level
      }
      renderOption={(option) => {
        return (
          <>
            {formatMatchKey(option.key)}
            {option.actual_time && (
              <Chip
                className={classes.timeChip}
                size="small"
                label={moment.unix(option.actual_time).format('h:mm a')}
              />
            )}
          </>
        );
      }}
    />
  );
}

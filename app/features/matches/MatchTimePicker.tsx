import React, { ChangeEvent } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import { Schedule } from '@material-ui/icons';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

momentDurationFormatSetup(moment);

export default function MatchTimeOffsetChip({
  value,
}: {
  value: moment.Duration;
}): JSX.Element {
  return <Chip icon={<Schedule />} label={`Offset: ${value.format()}`} />;
}

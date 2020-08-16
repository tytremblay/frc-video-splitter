import React from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';

interface AllianceChipsProps {
  color: 'red' | 'blue';
  teamKeys: string[];
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'space-evenly',
      '& > *': {
        margin: theme.spacing(0.1),
      },
    },
    chip: {
      width: 47,
    },
  })
);

export default function AllianceChips(props: AllianceChipsProps) {
  const classes = useStyles();
  const { teamKeys, color } = props;
  return (
    <div className={classes.root}>
      {teamKeys?.map((team) => {
        const teamNumber = team.replace('frc', '');
        return (
          <Chip
            className={classes.chip}
            key={team}
            size="small"
            color={color === 'blue' ? 'primary' : 'secondary'}
            label={teamNumber}
          />
        );
      })}
    </div>
  );
}

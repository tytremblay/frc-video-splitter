import React from 'react';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import SplitterCard from './SplitterCard';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    item: {},
  })
);

export default function MatchesPanel(): JSX.Element {
  const classes = useStyles();

  return (
    <Grid
      className={classes.root}
      container
      spacing={1}
      direction="row"
      justify="center"
      alignItems="stretch"
    >
      <Grid item xs={12}>
        <SplitterCard />
      </Grid>
    </Grid>
  );
}

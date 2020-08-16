import React from 'react';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import MatchesCard from './MatchesCard';
import MatchVideoCard from './MatchVideoCard';
import EventsCard from '../events/EventCard';

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
      <Grid item xs={6}>
        <Grid
          className={classes.root}
          container
          spacing={1}
          direction="column"
          justify="center"
          alignItems="stretch"
        >
          <Grid item xs={12}>
            <EventsCard />
          </Grid>
          <Grid item xs={12}>
            <MatchesCard />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={6}>
        <MatchVideoCard />
      </Grid>
    </Grid>
  );
}

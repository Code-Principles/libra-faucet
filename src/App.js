import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography, Grid } from '@material-ui/core';
import MainSection from './MainSection';
import DonateControl from './DonateControl';
import LibraLogo from './libra-nav-logo.png'
import ReactGA from 'react-ga';
function initializeReactGA() {
  ReactGA.initialize('UA-104181983-3');
  ReactGA.pageview('/');
}
initializeReactGA();
const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(6),
  },
  card: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(3, 2),
    width: '50%',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },

  },
  pageTitleContainer: {
    height: '70px',
    display: 'flex'
  },
  pageTitleImage: {
    height: '100%',
  },
  pageTitle: {
    float: 'right',
    height: '100%',
    paddingTop: '16px',
    marginLeft: '5px',
    fontSize:'52px',
  }
}));

export default function App() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center">
        <div className={classes.pageTitleContainer}>
          <img alt="libra banner" className={classes.pageTitleImage} src={LibraLogo}></img>
          <Typography className={classes.pageTitle} variant="h2" >
            Faucet
            </Typography>
        </div>

        <Paper className={classes.card}>
          <Typography variant="h5" >
            Get your testnet coins here
          </Typography>
          <MainSection />
        </Paper>
        <div className={classes.card}>
          <DonateControl />

        </div>
      </Grid>

    </div>
  );
}
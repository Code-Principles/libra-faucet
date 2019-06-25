import React, { useEffect, useState } from 'react';
import { constants } from './constants';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Stepper, Step, StepLabel, StepContent, Button, FormControl, InputLabel, Input, FormHelperText, CircularProgress, Typography, Paper, InputAdornment } from '@material-ui/core/';

import ReactGA from 'react-ga';
import LibraIcon from './libra_icon.png';

const useStyles = makeStyles(theme => ({
    root: {

    },
    button: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    actionsContainer: {
        marginBottom: theme.spacing(2),
    },
    resetContainer: {
        padding: theme.spacing(3),
    },
    formControl: {
        margin: theme.spacing(1),
        width: '100%'
    },
    formControlNumber: {
        margin: theme.spacing(1),
        width: '100px'
    },
    amountIcon: {
        width: '10px',
        height: '10px'
    },
    balanceIcon: {
        width: '40px',
        height: '40px'
    }
}));



export default function VerticalLinearStepper() {
    const classes = useStyles();
    const [activeStep, setActiveStep] = useState(0);
    const [addressError, setAddressError] = useState(false);
    const [errorCode, setErrorCode] = useState(false);
    const steps = ['Enter your wallet address', 'Wait for transaction to finish', 'Use your coins'];

    const [balance, setBalance] = useState(false);
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState(1);
    const [mintRequest, setMintRequest] = useState(false);
    const [mint, setMint] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!mintRequest) {
                return;
            }
            console.log('getMint:' + mintRequest.address + ',' + mintRequest.amount);

            setErrorCode(false);
            try {
                let rawResp = await fetch(`http://localhost:3000/mint?address=${mintRequest.address}&amount=${mintRequest.amount}`);
                let resp = await rawResp.json();
                console.log(resp);
                if (resp.errorCode) {
                    setErrorCode(resp.errorCode);
                    reportError(resp.errorCode);
                } else if (resp.mint) {
                    setMint(resp.mint === 'done');
                    reportMintEvent(mintRequest.address, mintRequest.amount);
                    setActiveStep(prevActiveStep => prevActiveStep + 1);
                } else {
                    setErrorCode(-1);
                    reportError(-1);
                }
            } catch (ex) {
                setErrorCode(-1);
                reportError(-1);
            }
        };

        fetchData();
    }, [mintRequest]);


    useEffect(() => {
        const fetchData = async () => {
            if (!mint) {
                return;
            }
            console.log('getBalance:' + address);
            setErrorCode(false);
            try {
                let rawResp = await fetch(`http://localhost:3000/balance?address=${address}`);
                let resp = await rawResp.json();
                console.log(resp);
                if (resp.errorCode) {
                    setErrorCode(resp.errorCode);
                    reportError(resp.errorCode);
                } else if (resp.balance) {
                    setBalance(resp.balance)
                } else {
                    setErrorCode(-1);
                    reportError(-1);
                }
            } catch (ex) {
                setErrorCode(-1);
                reportError(-1);
            }
        };

        fetchData();
    }, [mint, address]);

    function reportMintEvent(adr, count){
        ReactGA.event({
            category: 'User',
            action: 'Minted',
            value:count,
            label: adr+ ' minted '+ count
          });
    }

    function reportError(errCd){
        ReactGA.event({
            category: 'User',
            action: 'Server Error',
            value: errCd,
            label:constants.ERRORS[errCd.toString()]
          });
    }

    function handleNext() {
        setActiveStep(activeStep + 1);
    }

    function handleReset() {
        setActiveStep(0);
        setAddress("");
        setAmount(1);
        setAddressError(false);
        setErrorCode(false);
        setMintRequest(false);
        setMint(false);
    }

    function handleAddressChange(event) {
        let text = event.target.value;
        setAddress(text);

        setAddressError(!text || text.length !== 64);
    }
    function handleAmountChange(event) {
        let num = parseInt(event.target.value, 10);
        if (num < 1) {
            num = 1;
        } else if (num > 10) {
            num = 10;
        }
        setAmount(num);
    }

    function handleAddressStepNext() {
        handleNext();
        setMintRequest({ address, amount });
    }

    function getStepContent(step) {
        switch (step) {
            case 0:
                return getAddressStep();
            case 1:
                return getLoadingStep();
            case 2:
                return getBalanceStep();
            default:
                return 'Unknown step';
        }
    }

    function getBalanceStep() {
        return <div>
            <Typography>
                Your balance:
            </Typography>
            <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="center">
                <img alt="libra icon" className={classes.balanceIcon} src={LibraIcon}></img>
                <Typography variant="h2">
                    {balance ? balance : "--"}
                </Typography>
            </Grid>

            <div className={classes.actionsContainer}>
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        className={classes.button}>
                        Finish
                    </Button>
                </div>
            </div>
        </div>
    }

    function getLoadingStep() {
        return <div>
            {errorCode ?
                <div>
                    <Typography variant="h2" ><span role="img" aria-label="error img">😵</span></Typography>
                    <Typography variant="h5" gutterBottom>
                        {constants.ERRORS[errorCode.toString()]}
                    </Typography>
                    <div className={classes.actionsContainer}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => { setMintRequest({ address, amount }) }}
                            className={classes.button}>
                            Retry
                        </Button>
                    </div>
                </div>

                : <div>
                    <Typography>
                        Please be patient, minting in progress...
                    </Typography>
                    <CircularProgress />
                </div>}

        </div>
    }

    function getAddressStep() {
        return (
            <div>
                <FormControl className={classes.formControl} error={addressError}>
                    <InputLabel >Address</InputLabel>
                    <Input
                        fullWidth
                        value={address}
                        onChange={handleAddressChange} />
                    {addressError ?
                        <FormHelperText>Invalid address format</FormHelperText>
                        : null}

                </FormControl>
                <FormControl className={classes.formControlNumber}>
                    <InputLabel >Amount</InputLabel>
                    <Input
                        type="number"
                        value={amount}
                        onChange={handleAmountChange}
                        startAdornment={
                            <InputAdornment position="start">
                                <img alt="libra icon" className={classes.amountIcon} src={LibraIcon}></img>
                            </InputAdornment>} />
                </FormControl>
                <div className={classes.actionsContainer}>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={addressError || address.length === 0 || !amount}
                        onClick={handleAddressStepNext}
                        className={classes.button}>
                        Next
                    </Button>
                </div>
            </div>)
    }

    return (
        <div className={classes.root}>
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                        <StepContent>
                            {getStepContent(index)}
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
            {activeStep === steps.length && (
                <Paper square elevation={0} className={classes.resetContainer}>
                    <Typography>Want more?</Typography>
                    <Button onClick={handleReset} className={classes.button}>
                        Give Me More
                    </Button>
                    <br/><br/>
                    <Typography variant="caption">Remember to donate.</Typography>
                </Paper>
            )}
        </div>
    );
}
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import ReactGA from 'react-ga';

const useStyles = makeStyles(theme => ({
    root: {
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    innerExpansionPanel:{
        width:'100%',
    },
    innerExpansionPanelContent:{
        width:'100%',
    },
    innerExpansionPanelText:{
        wordBreak:'break-all',
        width:'100%',
        backgroundColor:'#f5f5f5',
        borderRadius:'5px',
        padding: theme.spacing(1),
    },
    copyButton: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },

}));
const content = [{ name: 'Bitcoin', address: '3B3DPvPcmWEEpeMKp8JREe5eWc5pFZN3AR' },
{ name: 'Ethereum', address: '0x01e1e61C60EFBA9C630DF33100D26071D064BaBc' },
{ name: 'XRP', address: 'r3gfRp1G26Pzp1e2FyXcLnGxpiaZW5JpuW' },
{ name: 'Monero', address: '49xe6PrMzmoHkSJpUDo9JL58y41S4Chc8Sw8cHHKygt7gt26dieMSPgS6RSKwvd2118ZkR4UcTykZd3WtTX44ZPfBouc3NH' }];

export default function ControlledExpansionPanels() {
    const classes = useStyles();
    const [expanded, setExpanded] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const [mainExpanded, setMainExpanded] = React.useState(false);

    const handleChange = panel => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const handleMainChange = panel => (event, isExpanded) => {
        setMainExpanded(isExpanded ? panel : false);
        if(isExpanded){
            reportDonateExpandedEvent();
        }
    };

    const handleCopy = (str, index) =>{
        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopied(index);
        setTimeout(()=>{
            setCopied(false);
        }, 3000)
    }

    const handleTooltipClose = () =>{
        setCopied(false);
    }

    function reportDonateExpandedEvent(){
        ReactGA.event({
            category: 'User',
            action: 'Donate expanded',
          });
    }

    const contentViews = content.map((item,index) =>
        <ExpansionPanel key={index} 
            className={classes.innerExpansionPanel}
            expanded={expanded === index} 
            onChange={handleChange(index)}>
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2bh-content"
                id="panel2bh-header"
            >
                <Typography className={classes.heading}>{item.name}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <div className={classes.innerExpansionPanelContent}>
                    <Typography
                        className={classes.innerExpansionPanelText}>
                        {item.address}
                </Typography>
                <Tooltip
                PopperProps={{
                  disablePortal: true,
                }}
                onClose={handleTooltipClose}
                open={copied===index}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                title="Copied"
                placement="right">
                    <Button onClick={()=>{handleCopy(item.address, index)}} className={classes.copyButton}>
                            Copy
                    </Button>
                </Tooltip>
                </div>
                
            </ExpansionPanelDetails>
        </ExpansionPanel>
    );

    return (
        <div className={classes.root}>
            <ExpansionPanel expanded={mainExpanded} onChange={handleMainChange(!mainExpanded)}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                >
                    <Typography className={classes.heading}>Donate</Typography>
                    <Typography className={classes.secondaryHeading}>Helps keep this site up to date with latest Libra releases</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Grid
                        container
                        direction="column"
                        justify="center"
                        alignItems="center"
                    >

                        {contentViews}
                    </Grid>
                </ExpansionPanelDetails>
            </ExpansionPanel>

        </div>
    );
}
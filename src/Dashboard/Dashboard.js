import React, { Fragment, Component } from 'react';
import { DateTimePicker } from 'material-ui-pickers';
import axios from 'axios';
import { Button } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import Slide from '@material-ui/core/Slide';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import moment from 'moment-timezone';
import Flight from './Flight';
import Tooltip from '@material-ui/core/Tooltip';
import './Dashboard.css';

function Transition(props) {
    return <Slide direction="up" {...props} />;
}


export default class Dashboard extends Component {
    constructor() {
        super()

        this.state = {
            tripname: '',
            confirmation: '',
            firstname: '',
            lastname: '',
            selectedDate: moment(),
            user_id: '',
            email: '',
            open: false,
            flights: []
        }
    }

    componentDidMount() {
        axios.get('/auth/me').then((res) => {
            this.setState({
                firstname: res.data.firstname,
                lastname: res.data.lastname,
                user_id: res.data.user_id,
                email: res.data.email
            })
        })
        this.getFlights();
    }

    getFlights = () => {
        axios.get('/api/flights').then(res => {
            this.setState({
                flights: res.data
            })
        })
    }

    handleConfirmation = (e) => {
        this.setState({
            confirmation: e.target.value
        })
    } 

    handletripname = (e) => {
        this.setState({
            tripname: e.target.value
        })
    } 

    handlefirstname = (e) => {
        this.setState({
            firstname: e.target.value
        })
    } 

    handlelastname = (e) => {
        this.setState({
            lastname: e.target.value
        })
    } 

    handleDateChange = (date) => {
        this.setState({ selectedDate: date });
    }

    handleEmail = (e) => {
        this.setState({email: e.target.value})
    }
    
    handleClickOpen = () => {
        this.setState({
            open: true
        });
    }

    handleClose = () => {
        this.setState({
            open: false,
            confirmation: '',
            date: '',
        });
    }

    addFlight = () => {
        const { confirmation, firstname, lastname, selectedDate, tripname, email } = this.state;
        let check_in_date = selectedDate.clone().subtract(1, 'days');
        let created_date_utc = moment.utc(selectedDate._i).format();
        let departure_date_utc = moment.utc(selectedDate).format();
        let check_in_date_utc = moment.utc(check_in_date).format();
        axios.post('/api/flights', { confirmation_number: confirmation, firstname: firstname, lastname: lastname, departure_date: departure_date_utc, check_in_date: check_in_date_utc, created_date: created_date_utc, tripname: tripname, email: email })
            .then(() => {
                this.setState({
                    tripname: '',
                    confirmation: '',
                    open: false
                }, this.getFlights())
            })
    }
    
    render() {
        const { selectedDate } = this.state;

        let flights = this.state.flights.map(flight => {
            return(
                <div key={flight.flight_id}>
                    <Flight flight_info={flight} getFlights={this.getFlights}/>
                </div>
            )
        })


        return (
            <div className = "dashboardContentContainer">

                <div className="flightsContainer">
                    <h2>My Flights</h2>
                    <div className="actualFlightContainer">
                        {flights}
                    </div>
                </div>

                <div className = "floatingAddButton">
                    <Tooltip title="Add Flight">
                        <Button onClick={this.handleClickOpen} variant="fab" color="primary" aria-label="add">
                            <AddIcon />
                        </Button>
                    </Tooltip>
                </div>
                
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-slide-title"
                    TransitionComponent={Transition}
                    keepMounted
                    aria-describedby="alert-dialog-slide-description"
                >
                    {/* <DialogTitle id="form-dialog-title">Add Flight</DialogTitle> */}
                    <div id= "form-dialog-title"><h3>Add Flight</h3></div>

                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Trip Name"
                            fullWidth
                            value={this.state.tripname}
                            onChange={this.handletripname}
                            style = {{marginBottom: '15px'}}
                        />

                        <TextField
                            margin="dense"
                            id="confirmationNumber"
                            label="Confirmation #"
                            fullWidth
                            value={this.state.confirmation}
                            onChange={this.handleConfirmation}
                            style = {{marginBottom: '15px'}}
                        />

                        <TextField
                            margin="dense"
                            id="firstName"
                            label="First Name"
                            fullWidth
                            value={this.state.firstname}
                            onChange={this.handlefirstname}
                            style={{ marginBottom: '15px' }}
                        />

                        <TextField
                            margin="dense"
                            id="lastName"
                            label="Last Name"
                            fullWidth
                            value={this.state.lastname}
                            onChange={this.handlelastname}
                            style={{ marginBottom: '15px' }}
                        />

                        <TextField
                            margin="dense"
                            id="email"
                            label="Email to Send Boarding Pass"
                            fullWidth
                            value={this.state.email}
                            onChange={this.handleEmail}
                            style={{ marginBottom: '15px' }}
                        />

                        <Fragment>
                            <div className="picker">
                                <DateTimePicker
                                    value={selectedDate}
                                    disablePast
                                    onChange={this.handleDateChange}
                                    fullWidth
                                    label="Departure Date"
                                    leftArrowIcon={<ChevronLeft />}
                                    rightArrowIcon={<ChevronRight />}
                                />
                            </div>
                        </Fragment>

                        {/* <input value={this.state.date} onChange={this.handledate} /> */}
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                            </Button>
                        <Button onClick={this.addFlight} color="primary">
                            Add
                            </Button>
                    </DialogActions>

                </Dialog>
            </div>
        )
    }
}
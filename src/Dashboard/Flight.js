import React, { Component } from 'react';
import moment from 'moment-timezone';
import ClearIcon from '@material-ui/icons/Clear';
import CalendarIcon from '@material-ui/icons/DateRange';
import AirplaneIcon from '@material-ui/icons/AirplanemodeActive';
import axios from 'axios';
import './Dashboard.css';
import Tooltip from '@material-ui/core/Tooltip';


export default class Flight extends Component{
    constructor() {
        super()

        this.state = {
            check_in_date: '',
            departure_date: '',
            firstname: '',
            lastname: '',
            tripname: '',
            checked_in: false,
            confirmation_number: '',
            error_message: null,
            open: false
        }
    }

    componentDidMount() {
        let { check_in_date, departure_date, firstname, lastname, tripname, checked_in, confirmation_number, error_message } = this.props.flight_info;
        let check_in_date_user = moment(check_in_date)._d.toString();
        let departure_date_user = moment(departure_date)._d.toString();
        this.setState({
            check_in_date: check_in_date_user,
            departure_date: departure_date_user,
            firstname,
            lastname,
            tripname,
            checked_in,
            confirmation_number,
            error_message
        }, () => {
            setTimeout(() => {
                this.setState({
                    open: true
                })
            }, 500 )
        })
    }

    handleOpen = () => {
        this.setState({
            open: !this.state.open
        })
    }

    deleteFlight = () => {
        axios.delete(`/api/flights/${this.props.flight_info.flight_id}`)
            .then(() => {
                this.props.getFlights();
            })
    }
    
    render() {
        let { check_in_date, departure_date, firstname, lastname, tripname, checked_in, confirmation_number } = this.state;

        let formatted_departure_date = `${departure_date.toString().slice(4, 10)}, ${departure_date.toString().slice(10,15)}`
        let formatted_check_in_date = `${check_in_date.toString().slice(4, 10)}, ${check_in_date.toString().slice(10, 15)}`
        let check_in_time = moment(check_in_date).format('h:mm A')

        return (
            <div>

                <div onClick={this.handleOpen} className="flightTitle">
                    <div className="iconWord"><AirplaneIcon style={{ marginRight: '5px' }} /><h3>{tripname}</h3></div>
                    <div className="iconWord"><CalendarIcon style={{marginRight: '5px'}}/><h3>{formatted_departure_date}</h3></div>
                    <Tooltip title="Delete Flight"><ClearIcon onClick={this.deleteFlight}/></Tooltip>
                </div>

                <div className= { (this.state.open) ? "flightInfoContainer" : "flightInfoContainer closed"} >

                    <div className="flightInfo ">
                            <h3>Passenger Name</h3>
                        <div className= "centerizeP passengerName">
                            <p>{firstname} {lastname}</p>
                        </div>
                    </div>

                    <div className="flightInfo ">
                            <h3>Confirmation #</h3>
                        <div className="centerizeP confirmationNumber">
                            <p>{confirmation_number}</p>
                        </div>
                    </div>
                    
                    <div className="flightInfo">
                            <h3>Check-In Date</h3>
                        <div className="centerizeP checkInDate">
                            <p>{formatted_check_in_date}<br /><span>{check_in_time}</span></p>
                        </div>
                    </div>

                    {(this.state.error_message !== null) ?
                        <div className="flightInfo">
                            <h3>Checked In?</h3>
                            <div className="centerizeP checkedInStatusFalse">
                                <p>No</p>
                            </div>
                        </div>
                    :
                    (checked_in) ?
                        <div className="flightInfo ">
                                <h3>Checked In?</h3>
                            <div className="centerizeP checkedInStatusTrue">
                                <p>Yes</p> 
                            </div>
                        </div>
                        :
                        <div className="flightInfo">
                            <h3>Checked In?</h3>
                            <div className="centerizeP checkedInStatusFalse">
                                <p>No</p>
                            </div>
                        </div>
                    }
                </div>
                
                {(this.state.error_message !== null) ?
                <div className = "errorMessage">
                    <h3>From Southwest: "{this.state.error_message}" Please check your information and re-submit your request.</h3>
                </div>    
                :
                null
                }

            </div>
        )
    }
}
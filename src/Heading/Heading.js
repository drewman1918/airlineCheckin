import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import './Heading.css';

export default class Heading extends Component {
    render() {
        return (
            <div className="header">
                <Button color = "default" variant = "outlined">Admin</Button>
                <h1>Southwest Check-In</h1>
                <Button color="default" variant="outlined">Logout</Button>
            </div>
        )
    }
}
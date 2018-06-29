import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { HashRouter } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import MomentUtils from 'material-ui-pickers/utils/moment-utils';


const theme = createMuiTheme({
    palette: {
        primary: {
            light: '#ffc63d',
            main: '#ffc63d',
            dark: '#ffc63d',
            contrastText: '#fff',
        },
        secondary: {
            light: '#304cb2',
            main: '#304cb2',
            dark: '#304cb2',
            contrastText: '#fff',
        },
    },
});


ReactDOM.render(
<HashRouter>
    <MuiThemeProvider theme={theme}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
            <App />
        </MuiPickersUtilsProvider>
    </MuiThemeProvider>
</HashRouter>
    , document.getElementById('root'));

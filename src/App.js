import React, { Component } from 'react';
import axios from 'axios';
import routes from './routes';
import Heading from './Heading/Heading';
import './App.css';

class App extends Component {
  
  componentDidMount() {
    axios.get('/auth/me').then( (res) => console.log(res.data))
  }
  
  render() {
    return (
      <div className="App">
        <div className="theHeader"><Heading /></div>
        <div className="main">
          {routes}
        </div>
      </div>
    );
  }
}

export default App;

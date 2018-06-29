import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Dashboard from './Dashboard/Dashboard';
import Landing from './Landing/Landing';

const routes = (
    <Switch>
        <Route exact path="/" component={Landing}/>
        <Route path="/dashboard" component={Dashboard}/>
    </Switch>
)

export default routes;
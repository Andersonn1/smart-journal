import React from 'react';
import './App.css';
import Login from './Login';
import { Route, Switch, withRouter } from 'react-router-dom';
import Register from './Register';
import Error from './Error';
import Dashboard from './Dashboard';
function App({ history }) {

  return (
    <div className="App">
      <Switch>
        <Route exact path="/" history={history} component={Login} />
        <Route path="/signup" history={history} component={Register} />
        <Route path="/dashboard" history={history} component={Dashboard} />
        <Route component={Error} />
      </Switch>
    </div >
  );
}

export default withRouter(App);
import React from 'react';
import './App.css';
import Login from './Login';
import { Route, Switch } from 'react-router-dom';
import Register from './Register';
import Error from './Error';
import Dashboard from './Dashboard';
function App() {

  return (
    <div className="App">
      <Switch>
        <Route exact path="/" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/dashboard" component={Dashboard} />
        <Route component={Error} />
      </Switch>
    </div >
  );
}

export default App;
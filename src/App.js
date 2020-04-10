import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Header from "./Header.js";
import Login from "./Login";
import Client from "./Client";
import Dashboard from "./Dashboard.js";
import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import 'font-awesome/css/font-awesome.min.css'


class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <div>
            <Header triggerUpdate={this.triggerUpdate}/>
            <Route exact path="/" component={Dashboard} />
            <Route path="/clients" component={Dashboard}/>
            <Route path="/login" component={Login}/>
            <Route path="/client/:id" component={Client}/>
          </div> 
          <ToastContainer autoClose={3000}/>
        </div>
      </Router>
    );
  }
}

export default App;

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { Router, Route, Link, browserHistory } from 'react-router';
import CommentBox from "./CommentBox";
import Login from "./Login";

//TODO set global variable
//loggedIn=someFunction state=someDictionary

var LoginWrapper = React.createClass({
    render: function() {
        return (
            <Login endpoint="/api/login" />
        );
    }
});

ReactDOM.render(

  <Router history={browserHistory}>
    <Route path="/" component={CommentBox}/>
    <Route path="/login" component={LoginWrapper} />
  </Router>
  ,
  document.getElementById('root')
);

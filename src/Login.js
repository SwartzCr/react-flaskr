import React, { Component } from 'react';
import { browserHistory } from 'react-router';

var LoginBox = React.createClass({
  getInitialState: function() {
    return {endpoint: 'login', btext: "Sign Up", altText: "Login"};
  },
  handleActionChange: function() {
    if(this.state.endpoint=='signup') {
        this.setState({endpoint: 'login'});
        this.setState({btext: 'Sign Up'});
        this.setState({altText: 'Login'});
    }
    if(this.state.endpoint=='login') {
        this.setState({endpoint: 'signup'});
        this.setState({btext: 'Login'});
        this.setState({altText: 'Sign Up'});
    }
  },
  render: function() {
    return (
      <div className="loginBox">
       <h2>{this.state.altText}</h2>
        <button value={this.state.endpoint} onClick={this.handleActionChange}>{this.state.btext}</button>
        <Login endpoint={this.state.endpoint} />
      </div>
    );
  }
});

var Login = React.createClass({
  getInitialState: function() {
    return {username: '', password: '', error: ''};
  },
  handleLoginSubmit: function(login) {
    var endpoint = '/api/' + this.props.endpoint;
    $.ajax({
      //url: this.props.endpoint,
      // TODO why isn't this reading props right
      url: endpoint,
      dataType: 'json',
      type: 'POST',
      data: login,
      success: function(data) {
          console.log("successfully logged in!");
          //this.props.loggedIn({username: username});
          browserHistory.push('/');
      }.bind(this),
      error: function(xhr, status, err) {
        console.log(err);
        this.setState({error: err.toString()});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleUsernameChange: function(e) {
    this.setState({username: e.target.value});
  },
  handlePasswordChange: function(e) {
    this.setState({password: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var username = this.state.username.trim();
    var password = this.state.password.trim();
    if (!password || !username) {
      //TODO decorate this so that it flashes red or something
      this.setState({error: "Username and Password required"});
      return;
    }
    this.handleLoginSubmit({username: username, password: password});
    this.setState({username: '', password: '', error: ''});
  },
  render: function() {
    return (
     <div>
      <div>{this.state.error} </div>
      <form className="loginForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={this.state.username}
          onChange={this.handleUsernameChange}
        />
        <input
          type="text"
          placeholder="Password"
          value={this.state.password}
          onChange={this.handlePasswordChange}
        />
        <input type="submit" value="Post" />
      </form>
     </div>
    );
  }
});

//TODO make an abstraction for the endpoint url
export default LoginBox

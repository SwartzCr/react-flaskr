import React, { Component } from 'react';
import { browserHistory } from 'react-router';

var Comment = React.createClass({

  render: function() {
    return (
      <div className="comment">
        <h2 className="commentTitle">
          {this.props.title}
        </h2>
        {this.props.children}
      </div>
    );
  }
});

var CommentContainer = React.createClass({
    render: function() {
        return (
            <CommentBox url="/api/comments" pollInterval={2000} />
        );
    }
});

var CommentBox = React.createClass({
  getLoggedIn: function() {
    var loggedIn = false;
    $.ajax({
      url: '/api/loggedin',
      dataType: 'json',
      cache: false,
      success: function(e) {
        this.setState({loggedIn: true});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error("err", status, err.toString());
      }.bind(this)
    });
  },
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: [], loggedIn: false};
  },
  componentDidMount: function() {
    this.getLoggedIn();
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  //TODO figure out why this isn't updating the view
    handleLogout: function() {
    this.setState({logged: false});
  },
  render: function() {
    return (
      <div className="commentBox">
        <LogInOut logged={this.state.loggedIn} onLogout={this.handleLogout}/>
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var LogInOut = React.createClass({
  render: function() {
      var loginButton;
      if (this.props.logged) {
          loginButton = <LogoutButton onLogout={this.props.onLogout}/>;
      } else {
          loginButton = <LoginButton />;
      }
      return (
         <div>
          {loginButton}
         </div>
      );
  }
});

var LoginButton = React.createClass({
    logIn:  function() {
        browserHistory.push("/login");
    },
    render: function() {
        return (
           <button onClick={this.logIn}>Log In/Sign Up</button>
        );
    }
});

var LogoutButton = React.createClass({
    logOut: function() {
      $.ajax({
        url: '/api/logout',
        dataType: 'json',
        cache: false,
        success: function() {
            this.props.onLogout();
            browserHistory.push("/");
        }.bind(this),
        error: function(xhr, status, err) {
          console.error("err", status, err.toString());
        }.bind(this)
      });
    },
    render: function() {
        return (
           <button onClick={this.logOut}>Log Out</button>
        );
    }
});

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment) {
      return (
        <Comment title={comment.title} key={comment.id}>
          {comment.text}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  getInitialState: function() {
    return {title: '', text: '', tag: ''};
  },
  handleTitleChange: function(e) {
    this.setState({title: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleTagChange: function(e) {
    this.setState({tag: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var title = this.state.title.trim();
    var text = this.state.text.trim();
    if (!text || !title) {
      return;
    }
    this.props.onCommentSubmit({title: title, text: text, tag: tag});
    this.setState({title: '', text: ''});
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={this.state.title}
          onChange={this.handleTitleChange}
        /><br>
        <input
          type="text"
          placeholder="Say something..."
          value={this.state.text}
          onChange={this.handleTextChange}
        /><br>
        <CommentTag handleChange={this.handleTagChange} /><br>
        <input type="submit" value="Post" />
      </form>
    );
  }
});
var TagElement = React.createClass({
    render: function(){
        return (
          <input type="radio" name="tag" value={this.props.val}>{this.props.val}
        );
    }
});
              
var CommentTag = React.createClass({
    getInitialState: function() {
        return {tags: [], toRender: []};
    },
    loadTagsFromServer: function() {
      $.ajax({
        url: '/api/tags',
        dataType: 'json',
        cache: false,
        success: function(data) {
          this.setState({tags: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    },
    componentDidMount: function() {
      setInterval(this.updateTags, 2000);
    },
    updateTags: function() {
      this.loadTagsFromServer();
      this.setState(toRender: []);
      //TODO likely tags isn't a simple array
      for (var i=0; i <this.state.tags.length(); i++) {
         toRender.push(<TagElement val=this.props.tags[i] />);
      }
    },
    render: function() {
        return (
            <form onClick={this.props.handleChange}>
              {this.state.tagOptions}
            </form>
        );
    }
});
export default CommentContainer

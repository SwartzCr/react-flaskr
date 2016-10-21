import React, { Component } from 'react';
import { browserHistory } from 'react-router';

var Comment = React.createClass({

  render: function() {
    return (
      <li className="comment">
        <h2 className="commentTitle">
          {this.props.title}
        </h2>
        {this.props.children}
      </li>
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
    //setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  handleLogout: function() {
    this.setState({loggedIn: false});
  },
  removeCommentById: function(id) {
      let updatedCommentList = this.state.data.filter((comment) => {
            return comment.id !== parseInt(id, 10);
      });
      this.setState({data: updatedCommentList});
  },
  render: function() {
    return (
      <div className="commentBox">
        <LogInOut logged={this.state.loggedIn} onLogout={this.handleLogout}/>
        <h1>Comments</h1>
        <CommentList data={this.state.data} removeCommentById={this.removeCommentById}/>
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
  commentRemove: function(e) {
      let id = e.target.attributes["data-id"].value;
      $.ajax({
          url: '/api/remove',
        dataType: 'json',
        cache: false,
        type: 'POST',
        data: {id: id},
        success: function() {
            this.props.removeCommentById(id);
        }.bind(this),
        error: function(xhr, status, err) {
          console.error("err", status, err.toString());
        }.bind(this)
      });
  },
  render: function() {
    var commentNodes = this.props.data.map((comment) => {
      return (
        <Comment title={comment.title} key={comment.id}>
          {comment.text}<br/>
          {comment.tag}
          <button onClick={this.commentRemove} data-id={comment.id}>Remove</button>
        </Comment>
      );
    })
    return (
      <div className="commentList" class="entries">
      <ul>
        {commentNodes}
      </ul>
      </div>
    );
  }
});

var CommentForm = React.createClass({
  getInitialState: function() {
    return {title: '', text: '', tag: '', newtag: ''};
  },
  handleTitleChange: function(e) {
    this.setState({title: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleTagChange: function(e) {
    this.setState({tag: e.target.value ? e.target.value : ''});
  },
  handleNewTagChange: function(e) {
    this.setState({newtag: e.target.value ? e.target.value : ''});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var title = this.state.title.trim();
    var text = this.state.text.trim();
    var tag = this.state.tag.trim();
    var newtag = this.state.newtag.trim();
    if (!text || !title) {
      return;
    }
    if (tag !== newtag){
        newtag = "";
    }
    this.props.onCommentSubmit({title: title, text: text, tag: tag, new_tag: newtag});
    this.setState({title: '', text: '', tag: '', newtag: ''});
  },
  render: function() {
    return (
      <form className="commentForm" class="add-entry" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={this.state.title}
          onChange={this.handleTitleChange}
        /><br/>
        <textarea
          placeholder="Say something..."
          value={this.state.text}
          onChange={this.handleTextChange}
        /><br/>
        <CommentTag handleChange={this.handleTagChange} handleNewTagChange={this.handleNewTagChange} tag={this.state.tag} newtag={this.state.newtag}/><br/>
        <input type="submit" value="Post" />
      </form>
    );
  }
});
var TagElement = React.createClass({
    render: function(){
        return (
          <div> 
            <input type="radio" name="tag" value={this.props.val} checked={this.props.checked} />
            {this.props.label}
          </div>
        );
    }
});
              
var CommentTag = React.createClass({
    getInitialState: function() {
        return {tags: [], toRender: [], tag: ""};
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
      this.loadTagsFromServer();
      //setInterval(this.updateTags, 2000);
    },
    handleChange: function(e) {
        this.props.handleChange(e);
    },
    handleNewTagChange: function(e) {
        this.props.handleNewTagChange(e);
    },
    render: function() {
        let tags = this.state.tags.map((tag) => {
            return (
                    <TagElement val={tag} label={tag} checked={tag === this.props.tag} />
                );
        });
        
        return (
            <form onClick={this.handleChange}>
                {tags}
                <input type="radio" name="tag" value="Other" checked={"Other" === this.props.tag} />Other<input onChange={this.handleNewTagChange} type="text" name="new_tag" value={this.props.newtag} />
            </form>
        );
    }
});
export default CommentContainer

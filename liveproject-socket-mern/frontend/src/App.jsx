import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./App.css";
import Chatbox from "./components/Chatbox";
import Metting from "./components/Metting";

const socket = io("http://localhost:5500");

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [commentText, setCommentText] = useState({});

  const getPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5500/api/posts");

      // jodi backend direct array pathay
      if (Array.isArray(res.data)) {
        setPosts(res.data);
      }
      // jodi backend {posts: []} pathay
      else {
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPosts();

    socket.on("postUpdated", (updatedPost) => {
      setPosts((oldPosts) =>
        oldPosts.map((post) =>
          post._id === updatedPost._id ? updatedPost : post,
        ),
      );
    });

    return () => {
      socket.off("postUpdated");
    };
  }, []);

  const createPost = async () => {
    if (!title.trim()) {
      alert("Post title required");
      return;
    }

    await axios.post("http://localhost:5500/api/posts/create", { title });

    setTitle("");
    getPosts();
  };

  const likePost = (postId) => {
    socket.emit("likePost", postId);
  };

  const sharePost = (postId) => {
    socket.emit("sharePost", postId);
  };

  const commentPost = (postId) => {
    if (!commentText[postId]) {
      alert("Comment required");
      return;
    }

    socket.emit("commentPost", {
      postid: postId,
      text: commentText[postId],
    });

    setCommentText({
      ...commentText,
      [postId]: "",
    });
  };

  return (
    <div className="container">
      <h1>Real Time Post App</h1>
      <p>Like, Comment, Share using MERN + Socket.IO</p>

      <div className="post-box">
        <input
          type="text"
          placeholder="Write post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <button onClick={createPost}>Add Post</button>
      </div>

      <div className="post-list">
        {posts.map((post) => (
          <div className="card" key={post._id}>
            <h2>{post.title}</h2>

            <div className="btn-group">
              <button onClick={() => likePost(post._id)}>
                👍 Like {post.likes || 0}
              </button>

              <button onClick={() => sharePost(post._id)}>
                🔗 Share {post.shares || 0}
              </button>
            </div>

            <div className="comment-box">
              <input
                type="text"
                placeholder="Write comment"
                value={commentText[post._id] || ""}
                onChange={(e) =>
                  setCommentText({
                    ...commentText,
                    [post._id]: e.target.value,
                  })
                }
              />

              <button onClick={() => commentPost(post._id)}>Comment</button>
            </div>

            <h4>Comments</h4>

            {!post.comments || post.comments.length === 0 ? (
              <p>No comments yet</p>
            ) : (
              post.comments.map((comment, index) => (
                <p className="comment" key={index}>
                  {comment.text}
                </p>
              ))
            )}
          </div>
        ))}
      </div>
      <div>
        <Chatbox/>
      </div>
      <div>
        <Metting/>
      </div>
    </div>
    
  );
}

export default App;

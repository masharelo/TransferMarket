import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './PostDetail.css';
import '../components/Posts.css';
import formatDate from '../utils/FormatDate';

const PostDetail = () => {
  const { postId } = useParams();
  const token = localStorage.getItem('token');
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPost(res.data);

        const related = await axios.get(`http://localhost:5000/api/auth/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const others = related.data.filter(p => p.post_id !== Number(postId)).slice(0, 2);
        const relatedList = [];
        if (others.length > 0) relatedList.push(others[0]);
        if (others.length === 2) relatedList.push({ isHomeIcon: true });
        if (others.length > 1) relatedList.push(others[1]);

        setRelatedPosts(relatedList);
      } catch (err) {
        console.error('Failed to load post:', err);
      }
    };

    fetchPost();
  }, [postId, token]);

  if (!post) return <p className='empty-favourites'>Loading post...</p>;

  return (
    <div className="post-detail-container">
      <div className="post-detail-content">
        <img
          src={`http://localhost:5000/uploads/posts/${post.picture}`}
          alt="post"
          className="post-detail-image"
        />

        <div className="post-detail-text">
          <h2>{post.title}</h2>
          <p className="post-detail-paragraph">{post.paragraph}</p>
          <p className="post-detail-meta">
            <small>
              Uploaded: {formatDate(post.uploaded)} <br /> 
              Type: {post.type} <br />
              Author: {post.author_name} {post.author_surname}
            </small>
          </p>
          <p><strong>Tags:</strong> {post.tags}</p>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <div className="related-posts-section">
          <h2>Related Posts</h2>
          <div className="related-posts-container">
            {relatedPosts.map((p, index) =>
              p.isHomeIcon ? (
                <Link
                  to="/"
                  key={`home-icon-${index}`}
                  className="home-icon"
                >
                  🏠
                </Link>
              ) : (
                <Link
                  key={p.post_id}
                  to={`/post/${p.post_id}`}
                  className="post-card"
                > 
                  <p className="related-title">{p.title}</p>
                  <img
                    src={`http://localhost:5000/uploads/posts/${p.picture}`}
                    alt="related"
                    className="post-image"
                  />
                  <p className="post-paragraph">{post.paragraph.slice(0, 100)}...</p>
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;

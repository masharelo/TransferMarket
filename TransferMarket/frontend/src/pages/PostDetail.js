import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

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

        // Fetch all posts
        const related = await axios.get(`http://localhost:5000/api/auth/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter out the current post and get up to 2 others
        const others = related.data.filter(p => p.post_id !== Number(postId)).slice(0, 2);

        // Insert home icon between posts
        const relatedList = [];
        if (others.length > 0) relatedList.push(others[0]);
        relatedList.push({ isHomeIcon: true });
        if (others.length > 1) relatedList.push(others[1]);

        setRelatedPosts(relatedList);
      } catch (err) {
        console.error('Failed to load post:', err);
      }
    };

    fetchPost();
  }, [postId, token]);

  if (!post) return <p>Loading post...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>{post.title}</h2>
      <img
        src={`http://localhost:5000/uploads/posts/${post.picture}`}
        alt="post"
        style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', marginBottom: '1rem' }}
      />
      <p>{post.paragraph}</p>
      <p>
        <small>
          Uploaded: {new Date(post.uploaded).toLocaleString()} | Type: {post.type}
        </small>
      </p>
      <p><strong>Tags:</strong> {post.tags}</p>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div style={{
          marginTop: '3rem',
          display: 'grid',
          gridTemplateColumns: relatedPosts.length === 3 ? '1fr 60px 1fr' : '1fr 60px',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {relatedPosts.map((p, index) =>
            p.isHomeIcon ? (
              <Link
                to="/"
                key={`home-icon-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  textDecoration: 'none',
                }}
              >
                🏠
              </Link>
            ) : (
              <Link
                key={p.post_id}
                to={`/post/${p.post_id}`}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <img
                  src={`http://localhost:5000/uploads/posts/${p.picture}`}
                  alt="related"
                  style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                />
                <p style={{ padding: '0.5rem' }}>{p.title}</p>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default PostDetail;

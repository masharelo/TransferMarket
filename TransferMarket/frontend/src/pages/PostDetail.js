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

  if (!post) return <p>Loading post...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      {/* Main Post Layout */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: '2rem',
        justifyContent: 'center',
        marginBottom: '2rem'
      }}>
        {/* Image */}
        <img
          src={`http://localhost:5000/uploads/posts/${post.picture}`}
          alt="post"
          style={{
            width: '100%',
            maxWidth: '400px',
            height: 'auto',
            objectFit: 'contain',
            borderRadius: '8px',
            backgroundColor: '#f0f0f0',
            flexShrink: 0,
          }}
        />

        {/* Text */}
        <div style={{ maxWidth: '600px', flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>{post.title}</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>{post.paragraph}</p>
          <p style={{ marginTop: '1rem', color: '#666' }}>
            <small>
              Uploaded: {new Date(post.uploaded).toLocaleString()} | Type: {post.type}
            </small>
          </p>
          <p><strong>Tags:</strong> {post.tags}</p>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Related Posts</h3>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            flexWrap: 'wrap'
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
                    fontSize: '2.5rem',
                    width: '60px',
                    height: '100%',
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
                    width: '280px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'inherit',
                    backgroundColor: '#fafafa',
                    transition: '0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={`http://localhost:5000/uploads/posts/${p.picture}`}
                    alt="related"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'contain',
                      backgroundColor: '#f0f0f0',
                    }}
                  />
                  <p style={{ padding: '0.5rem' }}>{p.title}</p>
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

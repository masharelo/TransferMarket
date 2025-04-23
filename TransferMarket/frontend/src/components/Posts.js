import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Posts = () => {
  const token = localStorage.getItem('token');
  const [posts, setPosts] = useState([]);
  const [filters, setFilters] = useState({
    hotNews: false,
    results: false,
    rumours: false,
    favourites: false,
  });
  const [visibleCount, setVisibleCount] = useState(5);

  const handleCheckboxChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
    setVisibleCount(5); // reset when filter changes
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const types = [];
        if (filters.hotNews) types.push('hot news');
        if (filters.results) types.push('results');
        if (filters.rumours) types.push('rumours');

        const res = await axios.get('http://localhost:5000/api/auth/posts', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            types: types.join(','),
            fav: filters.favourites,
          },
        });

        setPosts(res.data);
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };

    fetchPosts();
  }, [filters, token]);

  const loadMore = () => setVisibleCount(prev => prev + 5);

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
        {['hotNews', 'results', 'rumours', 'favourites'].map((key) => (
          <label key={key}>
            <input
              type="checkbox"
              name={key}
              checked={filters[key]}
              onChange={handleCheckboxChange}
            />
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </label>
        ))}
      </div>

      {/* Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
        }}>
        {posts.slice(0, visibleCount).map(post => (
            <Link 
            key={post.post_id} 
            to={`/post/${post.post_id}`} 
            style={{ 
                textDecoration: 'none', 
                color: 'inherit', 
                border: '1px solid #ccc', 
                padding: '1rem', 
                borderRadius: '8px',
                transition: '0.2s',
                background: '#fafafa',
                display: 'flex',
                flexDirection: 'column',
                height: '100%' // ensures full height for equal sizing
            }}
            >
            <h3 style={{ marginBottom: '0.5rem' }}>{post.title}</h3>
            <img 
                src={`http://localhost:5000/uploads/posts/${post.picture}`} 
                alt="post" 
                style={{ 
                width: '100%', 
                height: '200px', 
                objectFit: 'contain', 
                borderRadius: '6px',
                backgroundColor: '#f0f0f0',
                marginBottom: '0.5rem'
                }} 
            />
            <p style={{ flexGrow: 1 }}>{post.paragraph.slice(0, 100)}...</p>
            <small>
                {new Date(post.uploaded).toLocaleString()} | Type: {post.type}
            </small>
            </Link>
        ))}
        </div>


      {/* Load More Button */}
      {visibleCount < posts.length && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button onClick={loadMore}>Load More</button>
        </div>
      )}
    </div>
  );
};

export default Posts;

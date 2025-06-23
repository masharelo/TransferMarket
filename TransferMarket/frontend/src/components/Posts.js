import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Posts.css';
import formatDate from '../utils/FormatDate';

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
  const [titleFilter, setTitleFilter] = useState('');

  const handleCheckboxChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
    setVisibleCount(5);
  };

  const handleTitleChange = (e) => {
    setTitleFilter(e.target.value);
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

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(titleFilter.toLowerCase())
  );

  return (
    <div className="posts-container">
      <div className="filters-wrapper">
        <div className="filters">
          {['hotNews', 'results', 'rumours', 'favourites'].map((key) => (
            <label key={key} className="filter-label">
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

        <input
          type="text"
          placeholder="Filter by title..."
          value={titleFilter}
          onChange={handleTitleChange}
          className="title-filter"
        />
      </div>

      <div className="posts-grid">
        {filteredPosts.slice(0, visibleCount).map(post => (
          <Link
            key={post.post_id}
            to={`/post/${post.post_id}`}
            className="post-card"
          >
            <h3 className="post-title">{post.title}</h3>
            <img
              src={`http://localhost:5000/uploads/posts/${post.picture}`}
              alt="post"
              className="post-image"
            />
            <p className="post-paragraph">{post.paragraph.slice(0, 100)}...</p>
            <small className="post-meta">
              {formatDate(post.uploaded)} <br />
              Author: {post.author_name} {post.author_surname}
            </small>
          </Link>
        ))}
      </div>

      {visibleCount < filteredPosts.length && (
        <div className="load-more-container1">
          <button className="LoadMoreButton" onClick={loadMore}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Posts;

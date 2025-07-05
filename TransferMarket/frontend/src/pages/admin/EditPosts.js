import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './EditPosts.css';
import formatDate from '../../utils/FormatDate';

const EditPosts = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [mode, setMode] = useState('new');
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    paragraph: '',
    picture: null,
    type: 'rumours',
    tags: '',
  });
  const [filterTitle, setFilterTitle] = useState('');

  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/posts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'picture') {
      setFormData((prev) => ({ ...prev, picture: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('paragraph', formData.paragraph);
    data.append('type', formData.type);
    data.append('tags', formData.tags);
    data.append('folder', 'posts');
    if (formData.picture) data.append('picture', formData.picture);

    try {
      await axios.post('http://localhost:5000/api/admin/add_post', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
      setFormData({ title: '', paragraph: '', picture: null, type: 'rumours', tags: '' });
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
      setSelectedPost(null);
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleEditClick = (post) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      paragraph: post.paragraph,
      picture: null,
      type: post.type,
      tags: post.tags,
    });
    setMode('edit');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('paragraph', formData.paragraph);
    data.append('type', formData.type);
    data.append('tags', formData.tags);
    data.append('folder', 'posts');
    if (formData.picture) data.append('picture', formData.picture);

    try {
      await axios.put(`http://localhost:5000/api/admin/posts/${selectedPost.post_id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
      setFormData({ title: '', paragraph: '', picture: null, type: 'rumours', tags: '' });
      setSelectedPost(null);
      setMode('new');
    } catch (err) {
      console.error('Error updating post:', err);
    }
  };

  const filteredPosts = posts.filter((p) => p.title.toLowerCase().includes(filterTitle.toLowerCase()));

  return (
    <div className="editpost-container">
      <div className="editpost-sidebar">
        <button
          onClick={() => {
            setMode('new');
            setSelectedPost(null);
            setFormData({
              title: '',
              paragraph: '',
              picture: null,
              type: 'rumours',
              tags: '',
            });
          }}
          className="edit-buttons"
        >
          New Post
        </button>
        <button onClick={() => { setMode('edit_delete'); setSelectedPost(null); }} className="edit-buttons">Edit/Delete</button>
      </div>

      {mode === 'new' && (
        <form className="editpost-form" onSubmit={handleSubmit}>
          <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleInputChange} required />
          <textarea name="paragraph" placeholder="Paragraph" value={formData.paragraph} onChange={handleInputChange} required />
          <input type="file" name="picture" onChange={handleInputChange} accept="image/*" />
          <select name="type" value={formData.type} onChange={handleInputChange}>
            <option value="rumours">Rumours</option>
            <option value="transfer">Transfer</option>
            <option value="hot news">Hot News</option>
          </select>
          <input type="text" name="tags" placeholder="Tags (comma separated)" value={formData.tags} onChange={handleInputChange} autoComplete="off" />
          <div className='edit-info-buttons'>
            <button type="submit">Create Post</button>
          </div>
        </form>
      )}

      {mode === 'edit_delete' && (
        <div className="editpost-posts">
          <input type="text" placeholder="Filter by title" value={filterTitle} onChange={(e) => setFilterTitle(e.target.value)} className="posts-filter" />
          {filteredPosts.length === 0 ? (
            <p className="no-info-message">No posts with similar title.</p>
          ) : (
            <div className="editpost-grid">
              {filteredPosts.map((post) => (
                <div
                  key={post.post_id}
                  className="post-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/post/${post.post_id}`)}
                >
                  <h3 className="post-title">{post.title}</h3>
                  <img src={`http://localhost:5000/uploads/posts/${post.picture}`} alt="post" className="post-image" />
                  <p className="post-paragraph">{post.paragraph.slice(0, 100)}...</p>
                  <small className="post-meta">{formatDate(post.uploaded)} <br />Author: {post.author_name} {post.author_surname}</small>
                  <div className="edit-info-buttons" onClick={(e) => e.stopPropagation()}>
                    <button className="editpost-action-button" onClick={() => handleEditClick(post)}>Edit</button>
                    <button className="editpost-action-button" onClick={() => handleDelete(post.post_id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === 'edit' && selectedPost && (
        <form className="editpost-form" onSubmit={handleUpdate}>
          <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleInputChange} required />
          <textarea name="paragraph" placeholder="Paragraph" value={formData.paragraph} onChange={handleInputChange} required />
          <input type="file" name="picture" onChange={handleInputChange} accept="image/*" />
          <select name="type" value={formData.type} onChange={handleInputChange}>
            <option value="rumours">Rumours</option>
            <option value="transfer">Transfer</option>
            <option value="hot news">Hot News</option>
          </select>
          <input type="text" name="tags" placeholder="Tags (comma separated)" value={formData.tags} onChange={handleInputChange} />
          <div className='edit-info-buttons'>
            <button type="submit">Update Post</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditPosts;

import { useState } from 'react'

const Blog = ({ blog, handleLike, removeBlog, loggedUser }) => {

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const removeButtonStyle = {
    color: 'white',
    background: 'blue'
  }

  const [informationBlogVisible, setInformationBlogVisible] = useState(false)

  const changeVisibility = () => {
    setInformationBlogVisible(!informationBlogVisible)
  }

  return (
    <div style={blogStyle} className="blog">
      <div>
        {blog.title} {blog.author}
        <button onClick={changeVisibility}>
          {informationBlogVisible ? 'hide' : 'view'}
        </button>
      </div>

      {informationBlogVisible && (
        <div>
          <p>{blog.url}</p>
          <p>
            likes {blog.likes}{' '}
            <button onClick={() => handleLike(blog)}>like</button>
          </p>
          <p>{blog.user.name}</p>

          {loggedUser.username === blog.user.username && (
            <button style={removeButtonStyle} onClick={() => removeBlog(blog)}>
            remove
            </button>
          )}

        </div>
      )}
    </div>
  )}

export default Blog
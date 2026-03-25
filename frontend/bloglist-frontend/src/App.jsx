import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import { ErrorMessage, ExitMessage } from './components/Message'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [exitMessage, setExitMessage] = useState(null)
  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async event => {
    event.preventDefault()

    try {
      const userLogin = await loginService.login({ username, password }) // DEVUELVE TOKEN
      window.localStorage.setItem(
        'loggedBlogAppUser', JSON.stringify(userLogin)
      )
      blogService.setToken(userLogin.token)
      setUser(userLogin)
      setUsername('')
      setPassword('')

    } catch {
      setErrorMessage('Wrong username or password')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  )

  const logout = () => (
    <div>
      <p>
        {`${user.name} logged in`}
        <button onClick={ () => { window.localStorage.removeItem('loggedBlogAppUser'); setUser(null) } }>logout</button>
      </p>
    </div>
  )

  const createBlog = async (blogObject) => {
    try {
      const blog = await blogService.createBlog(blogObject)
      const updateBlogs = blogs.concat(blog)
      setBlogs(updateBlogs)

      setExitMessage(`a new blog ${blogObject.title} by ${blogObject.author} added`)

      blogFormRef.current.toggleVisibility()

      setTimeout(() => {
        setExitMessage(null)
      }, 5000)

    } catch {
      setErrorMessage('An error occurred while trying to save the blog')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleLike = async blog => {
    const updatedBlog = {
      ... blog,
      likes: blog.likes + 1,
      user: blog.user.id
    }

    try {
      await blogService.updateBlog(updatedBlog)
      const updatedListBlogs = await blogService.getAll()
      setBlogs(updatedListBlogs) // actualizar estado

    } catch {
      setErrorMessage('Error updating likes')
      setTimeout(() => setErrorMessage(null), 5000)
    }
  }

  const removeBlog = async blog => {
    if(window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      try {
        await blogService.removeBlog(blog)
        setBlogs(blogs.filter(b => b.id !== blog.id))
      }

      catch {
        setErrorMessage('Error removing blog')
        setTimeout(() => setErrorMessage(null), 5000)
      }
    }
  }

  const blogForm = () => {
    return (
      // todo lo que está dentro de <Togglable> se guarda en props.children
      <>
        <h2>blogs</h2>
        {logout()}
        <Togglable buttonLabel='create new blog' ref={blogFormRef}>
          <BlogForm createBlog={createBlog} />
        </Togglable>
      </>
    )
  }

  const listBlogs = () => (
    <div>
      {blogs
        .sort((a, b) => b.likes - a.likes)
        .map(blog =>
          <Blog key={blog.id} blog={blog} handleLike={handleLike} removeBlog={removeBlog} loggedUser={user}/>
        )}
    </div>
  )

  return (
    <div>
      <ErrorMessage message={errorMessage}/>
      <ExitMessage message={exitMessage}/>
      {user === null
        ? loginForm()
        : (
          <div>
            {blogForm()}
            {listBlogs()}
          </div>
        )
      }
    </div>
  )
}

export default App
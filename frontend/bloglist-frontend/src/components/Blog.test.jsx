import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

test('by default, the blog only displays the title and author', () => {

  const blog = {
    title: 'The Magic World',
    author: 'Peter Parker',
    url: 'www.themagicworld.com',
    likes: 5,
    user: {
      name: 'Tom Peterson'
    }
  }

  render(< Blog blog={blog} />)

  const titleAndAuthor = screen.getByText('The Magic World Peter Parker')
  expect(titleAndAuthor).toBeDefined()

  const url = screen.queryByText('www.themagicworld.com')
  expect(url).toBeNull()

  const likes = screen.queryByText('5')
  expect(likes).toBeNull()

})

test('clicking the button displays URL and likes', async () => {

  const blog = {
    title: 'The Magic World',
    author: 'Peter Parker',
    url: 'www.themagicworld.com',
    likes: 5,
    user: {
      name: 'Tom Peterson'
    }
  }

  render(< Blog blog={blog} />)

  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)

  const url = screen.queryByText('www.themagicworld.com')
  expect(url).toBeDefined()

  const likes = screen.queryByText('5')
  expect(likes).toBeDefined()

})

test('if the like button is clicked twice, the event handler that the component received as props is called twice', async () => {

  const blog = {
    title: 'The Magic World',
    author: 'Peter Parker',
    url: 'www.themagicworld.com',
    likes: 5,
    user: {
      name: 'Tom Peterson'
    }
  }

  const mockHandler = vi.fn()

  render(< Blog blog={blog} handleLike={mockHandler}/>)

  const user = userEvent.setup()

  const buttonView = screen.getByText('view')
  await user.click(buttonView)

  const buttonLike = screen.getByText('like')

  // dos clics
  await user.click(buttonLike)
  await user.click(buttonLike)

  expect(mockHandler.mock.calls).toHaveLength(2)

})
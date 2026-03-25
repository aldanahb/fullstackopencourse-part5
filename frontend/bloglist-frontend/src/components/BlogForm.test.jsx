import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('the form calls the event handler with correct details', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={createBlog} />)

  const titleInput = screen.getByPlaceholderText('write blog title here')
  const authorInput = screen.getByPlaceholderText('write blog author here')
  const urlInput = screen.getByPlaceholderText('write blog url here')
  const sendButton = screen.getByText('create')

  await user.type(titleInput, 'The Magic World')
  await user.type(authorInput, 'Peter Parker')
  await user.type(urlInput, 'www.themagicworld.com')

  await user.click(sendButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0].title).toBe('The Magic World')
  expect(createBlog.mock.calls[0][0].author).toBe('Peter Parker')
  expect(createBlog.mock.calls[0][0].url).toBe('www.themagicworld.com')
})
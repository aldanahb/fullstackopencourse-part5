const { test, expect, beforeEach, describe } = require('@playwright/test')
const helper = require ('./helper.js')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // Limpiar base de datos
    await request.post('http://localhost:3003/api/testing/reset')
    
    // Crear usuarios de prueba
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Zac Sprouse',
        username: 'zac430',
        password: 'secretkey'
      }
    })

    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Emily Stewart',
        username: 'emily_love',
        password: 'mypassword1'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('login form is shown', async ({ page }) => {
    const userInput = page.getByRole('textbox').first()
    const passwordInput = page.getByRole('textbox').last()
    const loginButton = page.getByRole('button', { name: 'login' })

    await expect(userInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(loginButton).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByRole('textbox').first().fill('zac430')
      await page.getByRole('textbox').last().fill('secretkey')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('Zac Sprouse logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      const message = page.getByText('Wrong username or password')

      await page.getByRole('textbox').first().fill('zac43') // usuario incorrecto
      await page.getByRole('textbox').last().fill('secretkey')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(message).toBeVisible()
      await expect(message).not.toBeVisible({ timeout: 6000 })

      await page.getByRole('textbox').first().fill('zac430') 
      await page.getByRole('textbox').last().fill('secretkeyy') // contraseña incorrecta
      await page.getByRole('button', { name: 'login' }).click()

      await expect(message).toBeVisible()
      await expect(message).not.toBeVisible({ timeout: 6000 })

      await page.getByRole('textbox').first().fill('') // usuario vacío
      await page.getByRole('textbox').last().fill('secretkey') 
      await page.getByRole('button', { name: 'login' }).click()

      await expect(message).toBeVisible()
      await expect(message).not.toBeVisible({ timeout: 6000 })

      await page.getByRole('textbox').first().fill('zac430') 
      await page.getByRole('textbox').last().fill('') // contraseña vacía
      await page.getByRole('button', { name: 'login' }).click()

      await expect(message).toBeVisible()
      await expect(message).not.toBeVisible({ timeout: 6000 })
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      // el usuario se loguea
      await page.getByRole('textbox').first().fill('zac430')
      await page.getByRole('textbox').last().fill('secretkey')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('Zac Sprouse logged in')).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', {name: 'create new blog'}).click()

      const titleInput = page.getByPlaceholder('write blog title here')
      const authorInput = page.getByPlaceholder('write blog author here')
      const urlInput = page.getByPlaceholder('write blog url here')

      await titleInput.fill('The Magic World')
      await authorInput.fill('Michael Chan')
      await urlInput.fill('www.themagicworld-michaelchan.com')

      await page.getByRole('button', {name: 'create'}).click()

      await expect(page.getByText('a new blog The Magic World by Michael Chan added')).toBeVisible()

      await expect(page.getByText('The Magic World Michael Chan')).toBeVisible()
      const blogContainer = page.getByText('The Magic World Michael Chan').locator('..')
      await expect(blogContainer.getByRole('button', {name: 'view'})).toBeVisible()
    })

    test('a blog can be modified (with a like)', async ({ page }) => {
      await helper.createBlog({ page, expect, title: 'The Magic World', author: 'Michael Chan', url: 'www.themagicworld-michaelchan.com' })

      const blogContainer = page.getByText('The Magic World Michael Chan').locator('..')

      await (blogContainer.getByRole('button', {name: 'view'})).click()

      const likeButton = blogContainer.getByRole('button', {name: 'like'})
      
      await likeButton.click()
      await expect(blogContainer.getByText('likes 1')).toBeVisible()
      await likeButton.click()
      await expect(blogContainer.getByText('likes 2')).toBeVisible()
      
      // recargar la página
      await page.reload()

      // volver a abrir el blog
      await blogContainer.getByRole('button', { name: 'view' }).click()

      // verificar que sigue en 2 (o sea que se guardó en la bdd)
      await expect(blogContainer.getByText('likes 2')).toBeVisible()
    })

    test('a user can delete the blog they created', async ({ page }) => {
      page.on('dialog', async dialog => { await dialog.accept() }) // queda escuchando si aparece la ventana

      await helper.createBlog({ page, expect, title: 'The Magic World', author: 'Michael Chan', url: 'www.themagicworld-michaelchan.com' })

      const blogContainer = page.getByText('The Magic World Michael Chan').locator('..')
      await blogContainer.getByRole('button', { name: 'view' }).click()

      const removeButton = blogContainer.getByRole('button', {name: 'remove'})
      await expect(removeButton).toBeVisible()
      await removeButton.click()

      await expect(page.getByText('The Magic World Michael Chan')).not.toBeVisible()

      await page.reload()

      await expect(page.getByText('The Magic World Michael Chan')).not.toBeVisible()
    })

    test('only the blog creator can see the button to delete it', async ({ page }) => {

      // usuario actual (Zac Sprouse) crea el blog
      await helper.createBlog({ page, expect, title: 'The Magic World', author: 'Michael Chan', url: 'www.themagicworld-michaelchan.com' })

      const blogContainer = page.getByText('The Magic World Michael Chan').locator('..')
      const buttonView = blogContainer.getByRole('button', {name: 'view'})

      await buttonView.click()

      await expect(blogContainer.getByRole('button', {name: 'remove'})).toBeVisible()

      // usuario actual cierra sesión 
      await page.getByRole('button', {name: 'logout'}).click()

      // otro usuario inicia sesión (Emily Stewart)
      const userInput = page.getByRole('textbox').first()
      const passwordInput = page.getByRole('textbox').last()

      await userInput.fill('emily_love')
      await passwordInput.fill('mypassword1')

      await page.getByRole('button', {name: 'login'}).click()

      await buttonView.click()

      await expect(blogContainer.getByRole('button', {name: 'remove'})).not.toBeVisible()
    })

    test('the tests are ordered by number of likes', async ({ page }) => {
      await helper.createBlog({ page, expect, title: 'The Magic World', author: 'Michael Chan', url: 'www.themagicworld-michaelchan.com' })
      await helper.createBlog({ page, expect, title: 'The Universe', author: 'Christina Snow', url: 'www.theuniverse-bychris.com' })
      await helper.createBlog({ page, expect, title: 'The Beautiful Love', author: 'Stella Philips', url: 'www.beautifullove-stella.com' })
      
      const likeBlog = async (title, count, actualLikes) => {

        const blogContainer = page.getByText(title).locator('..')
        await expect(blogContainer).toBeVisible()

        const viewButton = blogContainer.getByRole('button', {name: 'view'})
        if (await viewButton.isVisible()) await viewButton.click()

        const likeButton = blogContainer.getByRole('button', {name: 'like'})

        for (let i = 0; i < count; i++) {
          await likeButton.click()
          await expect(blogContainer.getByText(`likes ${actualLikes + i + 1}`)).toBeVisible()
        }
    }

      await likeBlog('The Magic World Michael Chan', 3, 0)
      await likeBlog('The Universe Christina Snow', 1, 0)
      await likeBlog('The Beautiful Love Stella Philips', 5, 0)

      // await page.reload()

      let blogs = await page.locator('.blog').all()

      await expect(blogs[0]).toContainText('The Beautiful Love Stella Philips')
      await expect(blogs[1]).toContainText('The Magic World Michael Chan')
      await expect(blogs[2]).toContainText('The Universe Christina Snow')

      await likeBlog('The Magic World Michael Chan', 3, 3)

      // await page.reload()

      blogs = await page.locator('.blog').all()

      await expect(blogs[0]).toContainText('The Magic World Michael Chan')
      await expect(blogs[1]).toContainText('The Beautiful Love Stella Philips')
      await expect(blogs[2]).toContainText('The Universe Christina Snow')

    })
  })
})
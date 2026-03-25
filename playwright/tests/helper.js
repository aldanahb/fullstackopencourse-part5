
const createBlog = async ({ page, expect, title, author, url }) => {

    await page.getByRole('button', {name: 'create new blog'}).click() 

    const titleInput = page.getByPlaceholder('write blog title here')
    const authorInput = page.getByPlaceholder('write blog author here')
    const urlInput = page.getByPlaceholder('write blog url here')

    await titleInput.fill(title)
    await authorInput.fill(author)
    await urlInput.fill(url)

    await page.getByRole('button', {name: 'create'}).click()

    await expect(page.getByText(`a new blog ${title} by ${author} added`)).toBeVisible()

    await expect(page.getByText(`${title} ${author}`)).toBeVisible() 
}

module.exports = { createBlog }
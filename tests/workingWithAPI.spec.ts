import { test, expect, request } from '@playwright/test';
// import { stringify } from "querystring";
import tags from '../test-data/tags.json';
import exp from 'constants';

test.beforeEach(async ({ page }) => {
  // we need to create mock configuration
  // we need to add the code here before we go to main page this is very important concept
  // when  we want to create a mock we  need to configure it inside the playwright framework before browser make a call to certain API otherwise playwright won't know which API to intercept.
  await page.route('*/**/api/tags', async route => {
    await route.fulfill({
      body: JSON.stringify(tags),
    });
  });

  await page.goto('https://conduit.bondaracademy.com/');
  // The below steps were removed as we learnt how to share auth state in auth.setup.ts
  // await page.getByText("Sign In").click();
  // await page.getByRole("textbox", { name: "Email" }).fill("testy@testy.com");
  // await page.getByRole("textbox", { name: "Password" }).fill("test123");
  // await page.getByRole("button").click();
});

test('has title', async ({ page }) => {
  await page.route('*/**/api/articles*', async route => {
    //fetch original response
    const response = await route.fetch();
    const responseBody = await response.json();
    responseBody.articles[0].title = 'This is a test title';
    responseBody.articles[0].description = 'This is a test description';
    // This enters/replaces the part of the payload you want to use
    // Please not that this will only replace the one section if the response returns like 10 items
    // Then the remaining 9 will stay the same
    await route.fulfill({
      body: JSON.stringify(responseBody),
    });
  });
  // Expect a title "to contain" a substring.
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await page.waitForTimeout(5000);
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a test title');
  await expect(page.locator('app-article-list p').first()).toContainText(
    'This is a test description',
  );
});

test('delete article', async ({ page, request }) => {
  //  The below section is no longer required due to using Sharing Auth state and learning about authtoken
  // const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
  //   // You need to provide the request body as the second argument of the post method
  //   data: { user: { email: 'testy@testy.com', password: 'test123' } },
  // });

  // const responseBody = await response.json();
  // const accessToken = responseBody.user.token;
  // console.log('Access Token:', accessToken); // Log the access token

  // await page.waitForTimeout(5000);

  // // Log the headers before making the request
  // console.log('Request Headers:', { Authorization: `Token ${accessToken}` });

  const articleResponse = await request.post(
    'https://conduit-api.bondaracademy.com/api/articles/',
    {
      data: {
        article: {
          title: 'This is a test title',
          description: 'This is a test description',
          body: 'qwd',
          tagList: [],
        },
      },
      // headers: { Authorization: `Token ${accessToken}` },
    },
  );

  console.log('Article Response:', await articleResponse.json()); // Log the response from the article request
  // Logging the response is very importing as you not get a error fails
  //I was getting back a Title must be unique response but the test would "Pass"
  //If I had a  a test to expect something following this it would still not tell me the issue

  expect(articleResponse.status()).toEqual(201);

  await page.getByText('Global Feed').click();
  await page.getByText('This is a test title').click();
  await page.getByRole('button', { name: 'Delete Article' }).first().click();
  await page.getByText('Global Feed').click();

  await expect(page.locator('app-article-list h1').first()).not.toContainText(
    'This is a test title',
  );
});

test('create article', async ({ page, request }) => {
  await page.getByText('New Article').click();
  await page.getByPlaceholder('Article Title').fill('Playwright');
  await page.getByRole('textbox', { name: "What's this article about?" }).fill('it does a thing');
  await page
    .getByRole('textbox', { name: 'Write your article (in markdown)' })
    .fill('Playwright Automation');
  await page.getByRole('button', { name: 'Publish Article' }).click();
  const articleResponse = await page.waitForResponse(
    'https://conduit-api.bondaracademy.com/api/articles/',
  );
  const articleResponseBody = await articleResponse.json();
  const slugID = articleResponseBody.article.slug;
  await expect(page.locator('app-article-page h1').first()).toContainText('Playwright');
  await page.getByText('Home').click();
  await page.getByText('Global Feed').click();
  await expect(page.locator('app-article-list h1').first()).toContainText('Playwright');

  // const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
  //   // You need to provide the request body as the second argument of the post method
  //   data: { user: { email: 'testy@testy.com', password: 'test123' } },
  // });

  // const responseBody = await response.json();
  // const accessToken = responseBody.user.token;
  // console.log('Access Token:', accessToken);

  const deleteArticleResponse = await request.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${slugID}`,
    // {
    //   headers: { Authorization: `Token ${accessToken}` },
    // },
  );

  expect(deleteArticleResponse.status()).toEqual(204);
});

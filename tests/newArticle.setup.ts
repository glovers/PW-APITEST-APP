import { test as setup, expect } from "@playwright/test";

setup("create new article", async ({ request }) => {
  const articleResponse = await request.post("https://conduit-api.bondaracademy.com/api/articles/", {
    data: {
      article: {
        title: "Likes test title",
        description: "This is a test description",
        body: "qwd",
        tagList: [],
      },
    },
    // headers: { Authorization: `Token ${accessToken}` },
  });

  console.log("Article Response:", await articleResponse.json()); // Log the response from the article request
  // Logging the response is very importing as you not get a error fails
  //I was getting back a Title must be unique response but the test would "Pass"
  //If I had a  a test to expect something following this it would still not tell me the issue

  expect(articleResponse.status()).toEqual(201);
  const response = await articleResponse.json();
  const slugID = response.article.slug;
  process.env["SLUGID"] = slugID;
});

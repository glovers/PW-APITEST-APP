import { request, expect } from "playwright/test";
import user from "../PW-APITEST-APP/.auth/user.json";
import fs from "fs";

async function globalSetup() {
  const authFile = ".auth/user.json";
  const context = await request.newContext();

  try {
    // Authenticate and get the access token
    const loginResponse = await context.post("https://conduit-api.bondaracademy.com/api/users/login", {
      data: { user: { email: "testy@testy.com", password: "test123" } },
    });
    const loginResponseBody = await loginResponse.json();
    const accessToken = loginResponseBody.user.token;

    // Update access token in user.json and environment variable
    user.origins[0].localStorage[0].value = accessToken;
    fs.writeFileSync(authFile, JSON.stringify(user));
    process.env["ACCESS_TOKEN"] = accessToken;

    // Make a request with the obtained access token
    const articleResponse = await context.post("https://conduit-api.bondaracademy.com/api/articles/", {
      data: {
        article: {
          title: "Globals Likes test title",
          description: "This is a test description",
          body: "qwd",
          tagList: [],
        },
      },
      headers: { Authorization: `Token ${process.env.ACCESS_TOKEN}` },
    });

    console.log("Article Response:", await articleResponse.json());
    expect(articleResponse.status()).toEqual(201);
    const response = await articleResponse.json();
    const slugID = response.article.slug;
    process.env["SLUGID"] = slugID;
  } catch (error) {
    console.error("Error:", error);
  }
}

export default globalSetup;

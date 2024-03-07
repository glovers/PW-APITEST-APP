import { test as setup, expect } from "@playwright/test";
import user from "../.auth/user.json";
import fs from "fs";

const authFile = ".auth/user.json";

// setup(' authentication', async ({ page }) => {
//   await page.goto('https://conduit.bondaracademy.com/');
//   await page.getByText('Sign In').click();
//   await page.getByRole('textbox', { name: 'Email' }).fill('testy@testy.com');
//   await page.getByRole('textbox', { name: 'Password' }).fill('test123');
//   await page.getByRole('button').click();
//   await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags');

//   await page.context().storageState({ path: authFile });
// });

setup("authentication", async ({ request }) => {
  // this way is doing it via Api /  without UI which is quicker

  const response = await request.post("https://conduit-api.bondaracademy.com/api/users/login", {
    // You need to provide the request body as the second argument of the post method
    data: { user: { email: "testy@testy.com", password: "test123" } },
  });

  const responseBody = await response.json();
  const accessToken = responseBody.user.token;
  console.log("Access Token:", accessToken); // Log the access token
  user.origins[0].localStorage[0].value = accessToken;
  fs.writeFileSync(authFile, JSON.stringify(user));

  process.env["ACCESS_TOKEN"] = accessToken;
});

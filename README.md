# Link Shorten API

This API is a link shortener and redirect handler for Gradia's services

Example shortened link: https://interview.gradia.com/lnk/DEMO-qeC-ZBQMM4eO5D9Huj0_D

Links are of the format: https://interview.gradia.com/lnk/{nanoid}

**Hint: use this to test your generated short links^^^**

## Input and output references

### Event object (input)

- Sample event:

```json
{ "original": "https://google.com", "trackVisits": true }
```

### Redirect object (output stored in DB)

```json
{
  "Code": "DEMO-qeC-ZBQMM4eO5D9Huj0_D",
  "Original": "https://bing.com",
  "TrackVisits": true,
  "Created": 1656617468561,
  "Visits": 3
}
```

## Functions and Usage

### CreateRedirectFunction

- Is given an input event object, and then puts a redirect object in the database
- Responsible for finding a valid short code to use
- Calls external backend API to perform DB operations
- Input Parameters:

| Name        | Type    | Description                                                                         | Required |
| ----------- | ------- | ----------------------------------------------------------------------------------- | -------- |
| original    | string  | The URL that will be redirected to                                                  | yes      |
| trackVisits | boolean | Optionally, specify whether to track visits on the redirect. False if not specified | no       |

## Your assigned task

This service has been producing errors and is failing to create short links successfully. The main task here is to get this services back up and running and up to spec.

After an internal investigation the team has narrowed the errors down to on specific file: "app.ts" in the CreateRedirectFunction. **All other files are confirmed bug free**

To test the file run:

```bash
npm run start
```

Links are of the format: https://interview.gradia.com/lnk/{nanoid}

**Hint: use this to test your generated short links^^^**

After the errors in the file are fixed, here is a high level breakdown of the expected functionality...

- Check if the URL has been shortened before:
  - If so, return the previously generated shortcode/nanoid
  - If not, generate a new shortcode/nanoid while checking for collisions. Once a valid shortcode/nanoid has been generated we call the API to store it in the DB for later use.

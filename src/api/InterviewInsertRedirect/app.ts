import { getClient, insertRedirect } from "../../CommonUtils/queries";
import Redirect from "../../CommonUtils/redirect";

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
};

/**
 * The response returned by this API
 */
interface ShortURLResp {
  // Whether or not this request was successful
  statusCode: number;
  body: any;
  headers: object;
}

/**
 * Entrypoint to the URL shortener
 */
export async function lambdaHandler(event: any): Promise<ShortURLResp> {
  console.log("🚀 ~ file: app.ts ~ line 37 ~ lambdaHandler ~ event", event);
  const redirect = JSON.parse(event.body) as Redirect;
  // const redirect = event.body as Redirect;
  let client = getClient();

  console.log("Attempting to create redirect from input: ", redirect);
  return new Promise((resolve, reject) => {
    insertRedirect(client, redirect)
      .then((resp) => {
        // Build up the correct response message
        let respShortUrlResp = {
          statusCode: 200,
          body: null,
          headers: HEADERS,
        };

        resolve(respShortUrlResp);
      })
      .catch((error) => {
        console.error("Dumping error: ", error);
        // It was not found, return error response
        let respShortUrlResp = {
          statusCode: 400,
          body: null,
          headers: HEADERS,
        };

        resolve(respShortUrlResp);
      });
  });
}

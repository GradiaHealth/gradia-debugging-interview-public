import { getClient, findRedirectByCode } from "../../CommonUtils/queries";

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

// TODO clean up all API function comments
/**
 * Entrypoint to the URL shortener
 */
export async function lambdaHandler(event: any): Promise<ShortURLResp> {
  console.log("🚀 ~ file: app.ts ~ line 37 ~ lambdaHandler ~ event", event);
  const code = decodeURIComponent(event.pathParameters.code);

  let client = getClient();

  console.log("Attempting to find redirect from url: ", code);
  return new Promise((resolve, reject) => {
    findRedirectByCode(client, code)
      .then((foundResp) => {
        console.log("🚀 ~ file: app.ts ~ line 54 ~ .then ~ foundResp", foundResp);
        // Build up the correct response message
        let respShortUrlResp = {
          statusCode: 200,
          body: true,
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

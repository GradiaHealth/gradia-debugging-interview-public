import { findRedirectByCode, getClient, updateVisits } from "../CommonUtils/queries";

const HEADERS = {
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
};

/**
 * Query for the given code, and if it's found, optionally increment the visits, and return the original URL
 *
 * @param code The code to search for
 */
function resolveRedirect(code: string): Promise<string> {
  let client = getClient();
  return new Promise((resolve, reject) => {
    findRedirectByCode(client, code)
      .then(async (res) => {
        console.debug("Found redirect ", res, " for code ", code);
        if (res.TrackVisits) {
          console.debug("Incrementing visits for code ", code);
          await updateVisits(client, code);
        }
        resolve(res.Original);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function lambdaHandler(event): Promise<any> {
  return new Promise((resolve, reject) => {
    console.log("Dumping event: ", event);
    if (event.hasOwnProperty("body")) {
      const code = JSON.parse(event.body).code;

      console.log("Checking redirect code ", code);
      // Direct invocation
      resolveRedirect(code)
        .then((foundRedirect) =>
          resolve({
            statusCode: 200,
            body: JSON.stringify({ redirect: foundRedirect }),
            headers: HEADERS,
          })
        )
        .catch((err) => {
          resolve({
            statusCode: 502,
            headers: HEADERS,
          });
        });
    } else {
      // Malformed input
      resolve({
        statusCode: 404,
        headers: HEADERS,
      });
    }
  });
}

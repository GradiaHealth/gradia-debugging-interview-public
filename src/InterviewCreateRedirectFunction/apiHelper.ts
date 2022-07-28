import Redirect from "./../CommonUtils/redirect";
import axios from "axios";

const API_BASE_URL = "https://a5ej2639gg.execute-api.us-east-1.amazonaws.com/prod";

/**
 * Query the API connected to DB for a particular redirect, by its code
 *
 * @param code The code to search for
 * @returns redirect A `Redirect` object if it was found, or otherwise, the promise will be rejected
 */
export async function findRedirectByCode(code: string): Promise<any> {
  let response;
  try {
    response = await axios.get(API_BASE_URL + "/code/" + encodeURIComponent(code));
  } catch (error) {
    console.log("No redirect found for provided code: ", code);
    return Promise.reject();
  }
  // Ex: Successfully found redirect code for YxumP-ib25zKUIpfTxsGP: https://yahoo.com
  console.log(`Successfully found redirect url for ${code}: ${response.data}`);
  return response.data;
}

/**
 * Query the API connected to DB for a particular redirect, by its URL
 *
 * @param url The URL to search for
 * @returns redirect A `Redirect` object if it was found, or otherwise, the promise will be rejected
 */
export async function findRedirectByURL(url: string): Promise<any> {
  let response;
  try {
    response = await axios.get(API_BASE_URL + "/url/" + encodeURIComponent(url));
  } catch (error) {
    console.log("No redirect found for provided url: ", url);
    return Promise.reject();
  }
  // Ex: Successfully found redirect code for https://yahoo.com: YxumP-ib25zKUIpfTxsGP
  console.log(`Successfully found redirect code for ${url}: ${response.data}`);

  return response.data;
}

/**
 * Pings API to insert the redirect into the database
 *
 * @param redirect The redirect object to create
 */
export async function insertRedirect(redirect: Redirect): Promise<void> {
  let response;
  try {
    response = await axios.post(API_BASE_URL + "/redirect/", redirect);
  } catch (error) {
    console.log("Error inserting the following redirect object: ", redirect);
    return Promise.reject();
  }
  console.log("Successfully inserted the following redirect object: ", redirect);
  return Promise.resolve();
}

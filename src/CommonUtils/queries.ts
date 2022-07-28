import Redirect from "./redirect";
import { DynamoDB } from "aws-sdk";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

export function getClient(): DocumentClient {
  return new DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
  });
}

export function redirectAdapter(item): Redirect {
  return {
    Code: item["Code"],
    Original: item["Original"],
    TrackVisits: item["TrackVisits"],
    Created: item["Created"],
    Visits: item.hasOwnProperty("Visits") ? item["Visits"] : undefined,
  };
}

/**
 * Query dynamo for a particular redirect, by its code
 *
 * @param client The dynamoDB client object
 * @param code The code to search for
 * @returns redirect A `Redirect` object if it was found, or otherwise, the promise will be rejected
 */
export function findRedirectByCode(client: DocumentClient, code: string): Promise<Redirect> {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: process.env.MAIN_TABLE_NAME,
      Key: {
        Code: code,
      },
    };
    client
      .get(params)
      .promise()
      .then((res) => {
        if (res.Item) {
          resolve(redirectAdapter(res.Item));
        } else {
          console.log("No url found for provided code");
          reject("No url found for provided code");
        }
      })
      .catch((err) => {
        console.warn(err);
        reject(err);
      });
  });
}

/**
 * Query dynamo for a particular redirect, by its URL
 *
 * @param client The dynamoDB client object
 * @param url The URL to search for
 * @returns redirect A `Redirect` object if it was found, or otherwise, the promise will be rejected
 */
export function findRedirectByURL(client: DocumentClient, url: string): Promise<Redirect> {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: process.env.MAIN_TABLE_NAME,
      IndexName: "Original-index",
      KeyConditionExpression: "Original = :url",
      ExpressionAttributeValues: { ":url": url },
    };

    client
      .query(params)
      .promise()
      .then((res) => {
        if (res.Items && res.Items.length > 0) {
          resolve(redirectAdapter(res.Items[0]));
        } else {
          console.log("No code found for provided url");
          reject("No code found for provided url");
        }
      })
      .catch((err) => {
        console.warn(err);
        reject(err);
      });
  });
}

/**
 * Actually insert the redirect into the database
 *
 * @param client The dynamoDB client
 * @param redirect The redirect object to create
 */
export function insertRedirect(client: DocumentClient, redirect: Redirect): Promise<void> {
  return new Promise((resolve, reject) => {
    let { Code, Original, TrackVisits, Created } = redirect;
    console.log(`Creating redirect from ${Code} to ${Original} with TrackVisits=${TrackVisits}`);
    let Item: any = {
      Code,
      Original,
      TrackVisits,
      Created,
    };
    // If track visits was enabled, add the "Visits" key to the schema,
    // starting at 0
    if (redirect.TrackVisits) {
      Item.Visits = redirect.Visits;
    }

    const params = {
      TableName: process.env.MAIN_TABLE_NAME,
      Item,
    };
    client
      .put(params)
      .promise()
      .then(() => resolve())
      .catch((err) => reject(err));
  });
}

/**
 * For a redirect with TrackVisits enabled, increment the number of visits
 *
 * @param client The dynamoDB client
 * @param code The code of the redirect to increment
 */
export function updateVisits(client: DocumentClient, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let params = {
      TableName: process.env.MAIN_TABLE_NAME,
      Key: {
        Code: code,
      },
      ExpressionAttributeValues: {
        ":inc": 1,
      },
      UpdateExpression: "ADD Visits :inc",
    };
    client
      .update(params)
      .promise()
      .then(() => resolve())
      .catch((err) => reject(err));
  });
}

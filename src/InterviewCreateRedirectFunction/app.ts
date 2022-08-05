import { nanoid } from "nanoid";
import {
	findRedirectByURL,
	findRedirectByCode,
	insertRedirect,
} from "./apiHelper";
//import event from "../../events/InterviewCreateRedirectFunction/direct_event.json";
import event from "../../events/InterviewCreateRedirectFunction/direct_event_2.json";
console.log("Input event: ", event);
lambdaHandler(event);

const HEADERS = {
	"Access-Control-Allow-Origin": "*",
};

/**
 * Configuration options for the URL formatter
 */
interface ShortURLOpts {
	originalUrl: string;
	// Optionally, record the number of visits to the URL in the database each time it's visited. Default is false
	trackVisits?: boolean;
}

/**
 * The response returned by this API
 */
interface ShortURLResp {
	// Whether or not this request was successful
	successful: boolean;
	redirect?: string;
	errorMessage?: string;
	headers: object;
	reused?: boolean;
}
/**
 * Entrypoint to the URL shortener
 * 
 * 
 *  Sample input:
  {
  "originalUrl": "https://google.com",
  "trackVisits": true
  }
 */
export async function lambdaHandler(event: any): Promise<ShortURLResp> {
	let options = {} as ShortURLOpts;

	// parse event depending on formatting of event input
	if (event.hasOwnProperty("body")) {
		options = JSON.parse(event.body) as ShortURLOpts;
	} else {
		options = event as ShortURLOpts;
	}

	return new Promise((resolve, reject) => {
		console.log("Attempting redirect creation with options...", options);
		if (options.hasOwnProperty("originalUrl")) {
			// Check if we already have a short code for the provided url
			findRedirectByURL(options.originalUrl)
				.then((foundResp) => {
					// Build up the correct response message
					let respShortUrlResp = {
						successful: true,
						redirect: foundResp,
						headers: HEADERS,
						reused: true,
					};

					resolve(respShortUrlResp);
				})
				.catch(() => {
					// No short code for url was not found, so create one
					createRedirect(options)
						.then((resp) => {
							console.log("Finished");
							resolve(resp);
						})
						.catch((err) => {
							console.log("Unable to create redirect");
							console.log(err);
							reject(err);
						});
				});
		} else {
			console.log("Missing originalUrl attribute on payload");
			reject(new Error("Malformed input"));
		}
	});
}

/**
 * Do the actual work of creating the redirect
 *
 * @param opts The options for the redirect
 * @returns resp The response information
 */
function createRedirect(opts: ShortURLOpts): Promise<ShortURLResp> {
	return new Promise(async (resolve, reject) => {
		let code: string;

		// Find a valid shortcode from nanoid
		code = await findValidNanoidID();
		insertRedirect({
			Code: code,
			Created: Date.now(),
			Original: opts.originalUrl,
			TrackVisits: opts.trackVisits,
			Visits: opts.trackVisits ? 0 : undefined,
		})
			.then(() =>
				resolve({
					successful: true,
					redirect: code,
					headers: HEADERS,
				})
			)
			.catch((err) => {
				console.warn(err);
				reject({
					successful: false,
					errorMessage: err,
					headers: HEADERS,
				});
			});
	});
}

/**
 * Generate nanoid IDs until we find one that's
 * not in the databsae - nanoid IDs are unique enough (and, supposedly, based on time) that there should literally
 * never be a collision, but I'm fine with burning a couple extra of ms of DB time on each request to double check.
 *
 * @param client The dynamoDB client to use
 * @returns code The string to use as the code for this redirect
 */
function findValidNanoidID(): Promise<string> {
	return new Promise(async (resolve, reject) => {
		let nanoidId: string;
		let i = 0; // for unlikely case handling so this doesn't eat too many extra resources
		do {
			if (i > 10) {
				console.log("Rejecting!");
				reject(
					"Couldn't find a valid code - probably a database error"
				);
				return;
			}
			nanoidId = nanoid();
			console.debug(`i=${i} Trying code`, nanoidId);
			i++;
		} while (await codeExists(nanoidId));
		console.debug("Found valid unused code", nanoidId);
		resolve(nanoidId);
	});
}

/**
 *  Checks if a specific nanoid is already used or not
 *
 * @param code nanoId to check
 * @returns true if we already have a redirect for the id, and false otherwise
 */
function codeExists(code: string): Promise<boolean> {
	console.log(
		"Checking if we already have a redirect set up for code: ",
		code
	);
	return new Promise((resolve, reject) => {
		findRedirectByCode(code)
			.then(() => resolve(true))
			.catch((err) => {
				if (err) {
					console.error(err);
					reject(err);
				}
				resolve(false);
			});
	});
}

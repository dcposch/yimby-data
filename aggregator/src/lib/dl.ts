import * as fs from "fs";

/**
 * Loads a file if already downloaded, otherwise downloads and saves.
 */
export async function loadOrDL(
  filepath: string,
  url: string,
  expectedContentType: string
) {
  if (fs.existsSync(filepath)) {
    const encoding = expectedContentType.startsWith("text/") ? "utf8" : null;
    return fs.readFileSync(filepath, { encoding });
  }
  const content = await dl(url, expectedContentType);
  fs.writeFileSync(filepath, content);
  return content;
}

/**
 * Downloads a file over HTTP.
 * Logs and throws on error, including all non-200 response codes.
 * Returns file contents, string for text/*, Buffer otherwise.
 */
export async function dl(url: string, expectedContentType: string) {
  console.log(`Downloading ${url}`);
  try {
    const response = await fetch(url);
    if (response.status !== 200) {
      throw new Error(`got ${response.status} - ${response.statusText}`);
    }
    const ct = response.headers.get("Content-Type").split(";")[0];
    if (ct !== expectedContentType) {
      throw new Error(`got ${ct}, expected ${expectedContentType}`);
    }
    if (ct.startsWith("text/")) return await response.text();
    else return Buffer.from(await response.arrayBuffer());
  } catch (e) {
    console.error(`Error ${e} downloading ${url}`);
    throw e;
  }
}

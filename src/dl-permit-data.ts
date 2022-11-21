import { loadOrDL } from "./lib/dl";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import * as mkdirp from "mkdirp";
import { setTimeout } from "timers/promises";

export default async function downloadPermitData() {
  const outDir = "data/dl-permit-data";
  mkdirp.sync(outDir);

  const url =
    "https://data.sfgov.org/api/views/kncr-c6jw/rows.csv?accessType=DOWNLOAD";
  const filepath = path.join(outDir, "SF_Planning_Permitting_Data.csv");
  await loadOrDL(filepath, url, "text/csv");

  // Alternatively, we could create a clean Sqlite DB in outDir
  // Then combine them into a final, joint DB at the end
  // This would let us run parsePc and downloadPermitData concurrently
  // Problem is, there's no clean way to combine 2 sqlite files
  // (Even if they have disjoint sets of tables, as far as I can tell.)
  console.log("Copying Sqlite DB...");
  const dbPath = "data/sf-planning.sqlite";
  fs.copyFileSync("data/parse-pc/out.sqlite", dbPath);
  await setTimeout(1000);

  console.log(`Importing ${filepath} into sqlite...`);
  execSync(
    `sqlite3 ${dbPath} -cmd '.separator ,' '.import ${filepath} permit'`
  );

  console.log(`Done, created ${dbPath}...`);
}

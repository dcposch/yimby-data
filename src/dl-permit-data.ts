import { loadOrDL } from "./lib/dl";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { openDB } from "./lib/db";
import * as mkdirp from "mkdirp";

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
  const dbPath = "data/sf-planning.sqlite";
  fs.copyFileSync("data/parse-pc/out.sqlite", dbPath);

  console.log(`Importing ${filepath} into sqlite...`);
  execSync(
    `sqlite3 ${dbPath} -cmd '.separator ,' '.import ${filepath} permit'`
  );

  console.log(`Finishing combined DB at ${dbPath}...`);
  const db = openDB(dbPath);
  db.serialize(() => {
    db.exec(`CREATE VIEW perm_min AS
      SELECT
        record_id,
        substring(record_type, 1, 18) as RECORD_TYPE,
        record_status,
        open_date,
        close_date,
        substring(project_name, 1, 24) as PROJ_NAME,
        number_of_units AS N_UNITS,
        developer_name, substring(developer_org, 1, 24) as DEV_ORG,
        substring(date_application_submitted, 1, 10) as DT_SUB,
        substring(date_of_final_hearing,1,10) as DT_FIN_HEAR,
        substring(description, 1, 60) as DESC
      FROM permit
    `);
  });
  db.close();
}

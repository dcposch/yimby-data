import { openDB } from "./lib/db";
import { setTimeout } from "timers/promises";
import { execSync } from "child_process";

export default async function exportProjects() {
  const dbPath = "data/sf-planning.sqlite";

  console.log(`Opening combined DB at ${dbPath}...`);
  const db = openDB(dbPath);

  console.log(`Collating project IDs...`);
  db.serialize(() => {
    db.exec(`DROP TABLE IF EXISTS proj_id`);
    db.exec(`
      CREATE TABLE proj_id (
        id TEXT NOT NULL PRIMARY KEY,
        name TEXT NOT NULL,
        addr TEXT NOT NULL
      )
    `);
    db.exec(`
      INSERT OR IGNORE INTO proj_id (id, name, addr)
      SELECT
        SUBSTR(record_id, 1, LENGTH(record_id)-3),
        SUBSTR(project_name, 1, 40),
        SUBSTR(project_address, 1, 40)
      FROM permit
      WHERE record_id LIKE '20%PRJ'
    `);

    const selCols = `
      SELECT
        id as ID,
        name as NAME,
        addr as ADDR,

        prj.record_id as PRJ_ID,
        substring(prj.record_type, 1, 18) as PRJ_TYPE,
        prj.record_status as PRJ_STAT,
        substring(prj.open_date, 1, 10) as PRJ_OPEN,
        substring(prj.close_date, 1, 10) as PRJ_CLOSE,
        prj.number_of_units AS N_UNITS,
        prj.developer_name as DEV_NAME,
        substring(prj.developer_org, 1, 24) as DEV_ORG,
        substring(prj.date_application_submitted, 1, 10) as DT_APP_SUBMITTED,
        substring(prj.date_application_accepted, 1, 10) as DT_APP_ACCEPTED,
        substring(prj.DATE_PLAN_CHECK_LETTER_ISSUED, 1, 10) as DT_PLAN_CHECK,
        substring(prj.DATE_PROJECT_DESC_STABLE, 1, 10) as DT_PROJ_DESC_STABLE,
        substring(prj.date_of_final_hearing, 1, 10) as DT_FIN_HEAR,
        replace(prj.description, CHAR(10), ' ') as PRJ_DESC,
        prj.class as PRJ_CLASS,

        eea.record_id as EEA_ID,
        eea.record_status as EEA_STAT,
        substring(eea.open_date, 1, 10) as EEA_OPEN,
        substring(eea.close_date, 1, 10) as EEA_CLOSE,
        substring(eea.record_type, 1, 18) as EEA_TYPE,

        env.record_id as ENV_ID,
        env.record_status as ENV_STAT,
        substring(env.open_date, 1, 10) as ENV_OPEN,
        substring(env.close_date, 1, 10) as ENV_CLOSE,
        substring(env.record_type, 1, 18) as ENV_TYPE,

        eec.record_id as EEC_ID,
        eec.record_status as EEC_STAT,
        substring(eec.open_date, 1, 10) as EEC_OPEN,
        substring(eec.close_date, 1, 10) as EEC_CLOSE,
        substring(eec.record_type, 1, 18) as EEC_TYPE,

        cua.record_id as CUA_ID,
        cua.record_status as CUA_STAT,
        substring(cua.open_date, 1, 10) as CUA_OPEN,
        substring(cua.close_date, 1, 10) as CUA_CLOSE,
        substring(cua.record_type, 1, 18) as CUA_TYPE
    `;
    db.exec(`DROP VIEW IF EXISTS proj_env_review`);
    db.exec(`CREATE VIEW proj_env_review AS
        ${selCols}
        FROM proj_id
        INNER JOIN permit prj on prj.record_id = (id || 'PRJ')
        INNER JOIN permit eea on eea.record_id = (id || 'EEA')
        LEFT JOIN permit env on env.record_id = (id || 'ENV')
        LEFT JOIN permit eec on eec.record_id = (id || 'EEC')
        LEFT JOIN permit cua on cua.record_id = (id || 'CUA')
    `);
    db.exec(`DROP VIEW IF EXISTS proj_env_exempt`);
    db.exec(`CREATE VIEW proj_env_exempt AS
        ${selCols}
        FROM proj_id
        INNER JOIN permit prj on prj.record_id = (id || 'PRJ')
        INNER JOIN permit eec on eec.record_id = (id || 'EEC')
        LEFT JOIN permit eea on eea.record_id = (id || 'EEA')
        LEFT JOIN permit env on env.record_id = (id || 'ENV')
        LEFT JOIN permit cua on cua.record_id = (id || 'CUA')
    `);
    db.exec(`DROP VIEW IF EXISTS proj_cua`);
    db.exec(`CREATE VIEW proj_cua AS
        ${selCols}
        FROM proj_id
        INNER JOIN permit prj on prj.record_id = (id || 'PRJ')
        INNER JOIN permit cua on cua.record_id = (id || 'CUA')
        LEFT JOIN permit eea on eea.record_id = (id || 'EEA')
        LEFT JOIN permit env on env.record_id = (id || 'ENV')
        LEFT JOIN permit eec on eec.record_id = (id || 'EEC')
    `);
  });
  db.close();
  await setTimeout(5000);

  console.log(`Exporting CSVs...`);
  execSync(
    [
      `sqlite3 ${dbPath} -cmd '.mode csv' '.headers on'`,
      `'.output data/proj-env-review.csv'`,
      `'SELECT * FROM proj_env_review'`,
      `'.output data/proj-env-exempt.csv'`,
      `'SELECT * FROM proj_env_exempt'`,
      `'.output data/proj_cua.csv'`,
      `'SELECT * FROM proj_cua'`,
      `'.output data/meeting_item.csv'`,
      `'SELECT i.* FROM items i inner join proj_env_review p on i.caseId like (p.id || "%") order by meetingId, caseId;'`,
    ].join(" ")
  );
  console.log(`Wrote csvs`);
}

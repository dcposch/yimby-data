import * as pdf from "pdf-parse";
import * as fs from "fs";
import * as path from "path";
import { openDB, wait } from "./lib/db";
import * as mkdirp from "mkdirp";

export default async function parsePc() {
  const outDir = "data/parse-pc";
  mkdirp.sync(outDir);

  const dbPath = path.join(outDir, "out.sqlite");
  fs.rmSync(dbPath, { force: true });
  const db = openDB(dbPath);

  // Create schema
  db.serialize(() => {
    db.exec(`
      CREATE TABLE meetings (
        id TEXT NOT NULL PRIMARY KEY
      )
    `);
    db.exec(`
      CREATE TABLE items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meetingId TEXT NOT NULL,
        section TEXT NOT NULL,
        caseId TEXT NOT NULL,
        caseType TEXT NOT NULL,
        contact TEXT NOT NULL,
        addrDesc TEXT NOT NULL,
        body TEXT NOT NULL
      )
    `);
  });
  await wait(db);

  // Parse Planning Commission meeting minutes
  const dir = "data/dl-pc";
  const filenames = fs.readdirSync(dir);
  for (const filename of filenames) {
    if (!filename.startsWith("2")) continue;
    if (!filename.endsWith(".pdf")) continue;
    db.run("INSERT INTO meetings (id) VALUES (?)", filename);

    const filepath = path.join(dir, filename);
    console.log(`\n\nReading ${filepath}`);
    const pdfBytes = fs.readFileSync(filepath);
    const data = await pdf(pdfBytes);

    const items = parseRawItems(data.text as string).map(cleanItem);
    for (const item of items) {
      console.log(
        `${item.section} / ${item.caseId} / ${item.contact} / ${item.addrDesc}`
      );
      db.run(
        `
INSERT INTO items (meetingId, section, caseId, caseType, contact, addrDesc, body)
VALUES            (        ?,       ?,      ?,        ?,       ?,        ?,    ?)`,
        filename,
        item.section,
        item.caseId,
        item.caseType,
        item.contact,
        item.addrDesc,
        item.body
      );
    }
  }

  db.close();
}

interface RawItem {
  section: string;
  header: string;
  body: string;
}

interface Item {
  section: string;
  header: string;
  caseId: string;
  caseType: string;
  contact: string;
  addrDesc: string;
  body: string;
}

/**
 * Parses items from a SF Planning Commission meeting minutes.
 * ("Items" are typically building projects under consideration.)
 */
function parseRawItems(pdfText: string) {
  const lines = pdfText.split("\n");
  let section: string = null;
  let header = [];
  let body = [];
  const items = [] as RawItem[];
  function addLastItem() {
    if (section && header.length) {
      items.push({ section, header: header.join(""), body: body.join(" ") });
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const stripped = strip(line);
    if (stripped.startsWith("meetingminutespage")) continue;
    if (strip(lines[i]) === "") continue;
    else if (line.match(/^[A-G]\. [A-Z]/)) {
      addLastItem();
      section = line;
      header = [];
      body = [];
    } else if (line.match(/^[0-9]+[a-z]?\. 2/)) {
      addLastItem();
      header = [];
      body = [];
      for (; i < lines.length; i++) {
        if (strip(lines[i]) === "") break;
        const parts = lines[i].split(" – ");
        header.push(parts[0]);
        if (parts.length > 1) {
          body.push(parts[1]);
          break;
        }
      }
    } else {
      body.push(line);
    }
  }
  addLastItem();
  return items;
}

function strip(line: string): string {
  return line.toLowerCase().replace(/\s+/g, "");
}

/**
 * Extracts clean planning commission agenda item from messy PDF text.
 */
function cleanItem(raw: RawItem): Item {
  const section = raw.section
    .trim()
    .replace(/\s+/g, " ")
    .replace("CO NSIDERATION", "CONSIDERATION")
    .replace("C O N S ENT CALEN DAR", "CONSENT CALENDAR")
    .replace("R EG ULAR", "REGULAR")
    .replace("CO MISSION", "COMMISSION");

  const header = raw.header
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\(([0-9][0-9][0-9])\) ([0-9][0-9][0-9])/, "$1-$2");

  const caseId = header.split(" ")[1];
  const contact = header.substring(
    header.indexOf("(") + 1,
    header.indexOf(")")
  );
  const addrDesc = header.substring(header.indexOf(")") + 1).trim();

  const caseM = caseId.match(/[0-9]([A-Z][A-Z][A-Z])$/);
  const caseType = caseM ? caseM[1] : "UNK";

  return {
    section,
    header,
    caseId,
    caseType,
    contact,
    addrDesc,
    body: raw.body,
  };
}

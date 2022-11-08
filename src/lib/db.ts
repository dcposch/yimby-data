import { Database } from "sqlite3";

import * as sqlite3 from "sqlite3";
sqlite3.verbose();

/**
 * Opens a Sqlite3 DB file.
 */
export function openDB(filename: string): Database {
  return new Database(filename);
}

export function wait(db: Database): Promise<void> {
  return new Promise((resolve) => db.wait(resolve));
}

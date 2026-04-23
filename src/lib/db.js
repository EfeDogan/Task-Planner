import { openDB } from "idb";

const DB_NAME = "task-planner-offline";
const DB_VERSION = 1;

let dbPromise = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("tasks")) {
          const store = db.createObjectStore("tasks", { keyPath: "id" });
          store.createIndex("user_id", "user_id");
        }
      },
    });
  }
  return dbPromise;
}

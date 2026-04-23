import { getDB } from "./db";

export async function getAllTasks(userId) {
  const db = await getDB();
  const all = await db.getAllFromIndex("tasks", "user_id", userId);
  return all.filter((t) => !t.deleted);
}

export async function getAllTasksRaw(userId) {
  const db = await getDB();
  return db.getAllFromIndex("tasks", "user_id", userId);
}

export async function getTask(id) {
  const db = await getDB();
  return db.get("tasks", id);
}

export async function putTask(task) {
  const db = await getDB();
  await db.put("tasks", task);
}

export async function putTasks(tasks) {
  const db = await getDB();
  const tx = db.transaction("tasks", "readwrite");
  for (const task of tasks) {
    tx.store.put(task);
  }
  await tx.done;
}

export async function getDirtyTasks(userId) {
  const all = await getAllTasksRaw(userId);
  return all.filter((t) => t.dirty);
}

export async function markClean(ids) {
  const db = await getDB();
  const tx = db.transaction("tasks", "readwrite");
  for (const id of ids) {
    const task = await tx.store.get(id);
    if (task) {
      task.dirty = false;
      tx.store.put(task);
    }
  }
  await tx.done;
}

export async function removeTasks(ids) {
  const db = await getDB();
  const tx = db.transaction("tasks", "readwrite");
  for (const id of ids) {
    tx.store.delete(id);
  }
  await tx.done;
}

export async function mergeRemoteTasks(userId, merged) {
  const db = await getDB();
  const existing = await db.getAllFromIndex("tasks", "user_id", userId);
  const mergedIds = new Set(merged.map((t) => t.id));

  const tx = db.transaction("tasks", "readwrite");

  for (const t of existing) {
    if (!mergedIds.has(t.id)) {
      tx.store.delete(t.id);
    }
  }

  for (const t of merged) {
    tx.store.put(t);
  }

  await tx.done;
}

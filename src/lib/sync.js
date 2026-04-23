import { supabase } from "./supabase";
import * as store from "./local-store";

export async function pullRemote(userId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;

  const remote = (data || []).map((r) => ({ ...r, dirty: false, deleted: false }));
  const local = await store.getAllTasksRaw(userId);
  const localMap = new Map(local.map((t) => [t.id, t]));

  const merged = remote.map((r) => {
    const l = localMap.get(r.id);
    if (l && l.dirty) return l;
    return r;
  });

  const remoteIds = new Set(remote.map((t) => t.id));
  for (const l of local) {
    if (!remoteIds.has(l.id) && l.dirty) {
      merged.push(l);
    }
  }

  await store.mergeRemoteTasks(userId, merged);
  return merged.filter((t) => !t.deleted);
}

export async function pushLocal(userId) {
  const dirty = await store.getDirtyTasks(userId);
  if (dirty.length === 0) return 0;

  const toUpsert = dirty.filter((t) => !t.deleted);
  const toDelete = dirty.filter((t) => t.deleted);

  if (toUpsert.length > 0) {
    const rows = toUpsert.map((t) => ({
      id: t.id,
      user_id: t.user_id,
      title: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority,
      due_date: t.due_date,
      due_time: t.due_time,
      completed: t.completed,
      created_at: t.created_at,
    }));
    const { error } = await supabase
      .from("tasks")
      .upsert(rows, { onConflict: "id" });
    if (error) throw error;
    await store.markClean(toUpsert.map((t) => t.id));
  }

  if (toDelete.length > 0) {
    for (const t of toDelete) {
      await supabase.from("tasks").delete().eq("id", t.id);
    }
    await store.removeTasks(toDelete.map((t) => t.id));
  }

  return dirty.length;
}

export async function syncAll(userId) {
  try {
    await pushLocal(userId);
  } catch (err) {
    console.error("push failed:", err);
  }
  return pullRemote(userId);
}

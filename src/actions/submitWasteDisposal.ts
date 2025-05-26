"use server"

import { createClient } from "@/src/utils/supabase/client";
import type { WasteDisposalLog } from "@/types";

// This is a server action that handles the form submission to the database
export async function submitWasteDisposal(log: Omit<WasteDisposalLog, "log_id" | "created_at" | "updated_at">) {
  const supabase = createClient();

  // Insert the log into the waste_logs table
  const { data, error } = await supabase
    .from("waste_logs")
    .insert([log])
    .select();

  if (error) {
    console.error("Error inserting waste log:", error);
    return { success: false, error };
  }

  return { success: true, data };
}

// Fetch all waste disposal logs from the database
export async function fetchWasteDisposalLogs() {
  const supabase = createClient();

  // Join drivers table to get driver info
  const { data, error } = await supabase
    .from("waste_logs")
    .select('*, drivers(*)');

  if (error) {
    console.error("Error fetching waste logs:", error);
    return { success: false, error };
  }

  return { success: true, data };
}

// Update a waste disposal log in the database by folio or log_id
export async function updateWasteDisposalLog(identifier: { folio?: string; log_id?: string }, updates: Partial<WasteDisposalLog>) {
  const supabase = createClient();
  let query;
  if (identifier.log_id) {
    query = supabase.from("waste_logs").update(updates).eq("log_id", identifier.log_id);
  } else if (identifier.folio) {
    query = supabase.from("waste_logs").update(updates).eq("folio", identifier.folio);
  } else {
    throw new Error("No identifier provided for update");
  }
  const { data, error } = await query.select();
  if (error) {
    console.error("Error updating waste log:", error);
    return { success: false, error };
  }
  return { success: true, data };
}
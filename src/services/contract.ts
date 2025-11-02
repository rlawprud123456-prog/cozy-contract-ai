import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

export type ContractInsert = TablesInsert<"contracts">;

export async function createContract(payload: ContractInsert) {
  const { data, error } = await supabase
    .from("contracts")
    .insert([payload])
    .select("*")
    .single();
  
  if (error) throw error;
  return data;
}

export async function listContracts() {
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function updateContractStatus(
  id: string,
  status: "pending" | "in_progress" | "completed" | "cancelled"
) {
  const { data, error } = await supabase
    .from("contracts")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();
  
  if (error) throw error;
  return data;
}

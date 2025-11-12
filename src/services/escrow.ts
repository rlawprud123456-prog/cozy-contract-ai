import { supabase } from "@/integrations/supabase/client";

export async function depositPayment(params: {
  contract_id: string;
  amount: number;
  type: "deposit" | "mid" | "final";
}) {
  const { data, error } = await supabase
    .from("escrow_payments")
    .insert({
      contract_id: params.contract_id,
      amount: params.amount,
      type: params.type,
      status: "held",
    })
    .select("*")
    .single();
  
  if (error) throw error;

  // 선금이면 계약 상태를 in_progress로 변경
  if (params.type === "deposit") {
    await supabase.rpc("set_contract_status_in_progress", {
      p_contract_id: params.contract_id,
    });
  }

  return data;
}

export async function getPaymentsByContract(contract_id: string) {
  const { data, error } = await supabase
    .from("escrow_payments")
    .select("*")
    .eq("contract_id", contract_id)
    .order("created_at", { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function requestApproval(payment_id: string) {
  const { data, error } = await supabase
    .from("escrow_payments")
    .update({
      status: "pending_approval",
    })
    .eq("id", payment_id)
    .select("*")
    .single();
  
  if (error) throw error;
  return data;
}

export async function approvePayment(payment_id: string, contract_id: string) {
  const { data, error } = await supabase
    .from("escrow_payments")
    .update({
      status: "released",
      released_at: new Date().toISOString(),
    })
    .eq("id", payment_id)
    .select("*")
    .single();
  
  if (error) throw error;

  // 모든 결제가 released면 계약을 completed로 변경
  await supabase.rpc("set_contract_status_completed_if_all_released", {
    p_contract_id: contract_id,
  });

  return data;
}

export async function rejectApproval(payment_id: string) {
  const { data, error } = await supabase
    .from("escrow_payments")
    .update({
      status: "held",
    })
    .eq("id", payment_id)
    .select("*")
    .single();
  
  if (error) throw error;
  return data;
}

export async function refundPayment(payment_id: string) {
  const { data, error } = await supabase
    .from("escrow_payments")
    .update({
      status: "refunded",
      refunded_at: new Date().toISOString(),
    })
    .eq("id", payment_id)
    .select("*")
    .single();
  
  if (error) throw error;
  return data;
}

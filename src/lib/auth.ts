import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "partner" | "user";

/**
 * 현재 사용자가 특정 역할을 가지고 있는지 확인
 * DB의 user_roles 테이블을 사용하여 서버사이드에서 검증
 */
export async function hasRole(userId: string, role: AppRole): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", role)
    .maybeSingle();

  if (error) {
    console.error("Role check error:", error);
    return false;
  }

  return !!data;
}

/**
 * 현재 사용자가 관리자인지 확인
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, "admin");
}

/**
 * 현재 사용자가 파트너(전문가)인지 확인
 * partners 테이블에서 user_id로 조회
 */
export async function isPartner(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("partners")
    .select("id, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Partner check error:", error);
    return false;
  }

  return !!data;
}

/**
 * 파트너 승인 상태 확인
 */
export async function getPartnerStatus(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("partners")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data.status;
}

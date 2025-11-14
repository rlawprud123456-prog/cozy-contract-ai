import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    partners: 0,
    contracts: 0,
    estimates: 0,
    pendingPayments: 0,
    damageReports: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersRes, partnersRes, contractsRes, estimatesRes, paymentsRes, damageRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("partners").select("*", { count: "exact", head: true }),
        supabase.from("contracts").select("*", { count: "exact", head: true }),
        supabase.from("estimate_requests").select("*", { count: "exact", head: true }),
        supabase.from("escrow_payments").select("*", { count: "exact", head: true }).eq("status", "pending_approval"),
        supabase.from("damage_reports").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        users: usersRes.count || 0,
        partners: partnersRes.count || 0,
        contracts: contractsRes.count || 0,
        estimates: estimatesRes.count || 0,
        pendingPayments: paymentsRes.count || 0,
        damageReports: damageRes.count || 0,
      });
    } catch (error) {
      console.error("Stats loading error:", error);
    }
  };

  return <AdminDashboard stats={stats} />;
}

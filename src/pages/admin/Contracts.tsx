import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminContracts } from "@/components/admin/AdminContracts";

export default function Contracts() {
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const { data } = await supabase
        .from("contracts")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setContracts(data);
    } catch (error) {
      console.error("Contracts loading error:", error);
    }
  };

  return <AdminContracts contracts={contracts} />;
}

import { supabase } from "@/integrations/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";

// 공통 에러 처리
const handleError = (error: PostgrestError | null) => {
  if (error) {
    console.error("API Error:", error);
    throw new Error(error.message);
  }
};

// 1. 인증 (Auth)
export const auth = {
  async getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  async logout() {
    await supabase.auth.signOut();
  },
  async signup({ name, email, password }: { name: string; email: string; password: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    if (error) throw error;
    return { user: data.user };
  }
};

// 2. 파트너 (Partners)
export const partners = {
  async listByCategory(category: string) {
    const { data, error } = await supabase
      .from("partner_profiles")
      .select("*")
      .eq("category", category)
      .eq("status", "approved");
    
    handleError(error);
    return { items: data || [] };
  },

  async getFeatured() {
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .eq("featured", true)
      .eq("status", "approved")
      .limit(5);
      
    handleError(error);
    return { items: data || [] };
  },

  async search(params: { region?: string; keyword?: string }) {
    let query = supabase.from("partner_profiles").select("*");
    
    if (params.keyword) {
      query = query.or(`business_name.ilike.%${params.keyword}%,description.ilike.%${params.keyword}%`);
    }
    
    const { data, error } = await query;
    handleError(error);
    return { items: data || [] };
  },

  async apply(formData: any) {
    const user = await auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");

    const { error } = await supabase.from("partners").insert({
      user_id: user.id,
      ...formData,
      status: "pending"
    });
    handleError(error);
  },

  async match(params: { city?: string; minRating?: number }) {
    let query = supabase.from("partners").select("*").eq("status", "approved");
    
    if (params.city) {
      query = query.ilike("business_name", `%${params.city}%`);
    }
    
    const { data, error } = await query;
    handleError(error);
    return { items: data || [] };
  }
};

// 3. 계약 (Contracts)
export const contracts = {
  async create(contractData: any) {
    const user = await auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");

    const { data, error } = await supabase
      .from("contracts")
      .insert({
        user_id: user.id,
        ...contractData,
        status: "pending"
      })
      .select()
      .single();

    handleError(error);
    return data;
  },

  async getMyContracts() {
    const user = await auth.getUser();
    if (!user) return { items: [] };

    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    handleError(error);
    return { items: data || [] };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", id)
      .single();
    
    handleError(error);
    return data;
  },

  // 계약 검토 이력 (localStorage 기반 - 레거시)
  history() {
    const stored = localStorage.getItem("contract_history");
    return { items: stored ? JSON.parse(stored) : [] };
  },

  remove(id: number) {
    const stored = localStorage.getItem("contract_history");
    const items = stored ? JSON.parse(stored) : [];
    const filtered = items.filter((item: any) => item.id !== id);
    localStorage.setItem("contract_history", JSON.stringify(filtered));
  }
};

// 4. 에스크로 (Escrow)
export const escrow = {
  async createPayment(contractId: string, amount: number, type: 'deposit' | 'mid' | 'final') {
    const { data, error } = await supabase
      .from("escrow_payments")
      .insert({
        contract_id: contractId,
        amount,
        type,
        status: "held"
      })
      .select()
      .single();
    handleError(error);
    return data;
  },

  async getByContract(contractId: string) {
    const { data, error } = await supabase
      .from("escrow_payments")
      .select("*")
      .eq("contract_id", contractId)
      .order("created_at", { ascending: true });
    handleError(error);
    return data || [];
  }
};

// 5. 커뮤니티 (Community)
export const community = {
  async getRecentPosts(limit = 3) {
    const { data, error } = await supabase
      .from("community_posts")
      .select("id, title, category, like_count, view_count, images")
      .order("created_at", { ascending: false })
      .limit(limit);
      
    handleError(error);
    return data || [];
  }
};

// 6. 피해 신고 조회 (Damage Reports)
export const damageReports = {
  async search(keyword: string) {
    const { data, error } = await supabase
      .from("damage_reports")
      .select("*")
      .or(`business_name.ilike.%${keyword}%,phone.ilike.%${keyword}%`);
      
    handleError(error);
    return { items: data || [] };
  },

  async getRecent(limit = 5) {
    const { data, error } = await supabase
      .from("damage_reports")
      .select("id, business_name, amount, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    handleError(error);
    return data || [];
  }
};

// 사기업체 조회 (scammers - damage_reports 기반)
export const scammers = {
  async search(params: { name?: string; phone?: string; license?: string }) {
    let query = supabase.from("damage_reports").select("*");
    
    const conditions: string[] = [];
    if (params.name) conditions.push(`business_name.ilike.%${params.name}%`);
    if (params.phone) conditions.push(`phone.ilike.%${params.phone}%`);
    if (params.license) conditions.push(`business_license.ilike.%${params.license}%`);
    
    if (conditions.length > 0) {
      query = query.or(conditions.join(","));
    }
    
    const { data, error } = await query;
    handleError(error);
    
    // damage_reports를 scammer 형태로 변환
    const items = (data || []).map((d: any) => ({
      id: d.id,
      name: d.business_name,
      phone: d.phone || "정보 없음",
      license: d.business_license || "정보 없음",
      cases: 1,
      note: d.description || "주의 필요"
    }));
    
    return { items };
  }
};

// 7. 견적 문의 (Estimates)
export const estimates = {
  async createRequest(data: any) {
    const user = await auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");

    const { error } = await supabase
      .from("estimate_requests")
      .insert({
        user_id: user.id,
        project_name: data.project_name || data.project_type || "견적 문의",
        client_name: data.client_name || "미입력",
        phone: data.contact_phone || data.phone || "미입력",
        location: data.location || "미입력",
        category: data.category || data.project_type || "일반",
        area: data.area || 0,
        description: data.ai_analysis_summary || data.description || "",
        estimated_budget: data.estimated_budget || null,
        status: "pending"
      });
    handleError(error);
  },
  
  async getMyRequests() {
    const user = await auth.getUser();
    if (!user) return { items: [] };

    const { data, error } = await supabase
      .from("estimate_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    handleError(error);
    return { items: data || [] };
  }
};

// 8. 관리자용 견적 관리
export const adminEstimates = {
  async getAllRequests() {
    const { data, error } = await supabase
      .from("estimate_requests")
      .select("*")
      .order("created_at", { ascending: false });
    handleError(error);
    return { items: data || [] };
  },

  async updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("estimate_requests")
      .update({ status })
      .eq("id", id);
    handleError(error);
  }
};

// 9. 증빙 패키지 (Evidence)
export const evidence = {
  async createPackage(projectName: string, contractorName?: string) {
    const user = await auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");

    const { data, error } = await supabase
      .from("evidence_packages")
      .insert({
        user_id: user.id,
        project_name: projectName,
        contractor_name: contractorName,
        status: "draft"
      })
      .select()
      .single();
    handleError(error);
    return data;
  },

  async addItem(packageId: string, item: { title: string; type: string; file_url: string }) {
    const { data, error } = await supabase
      .from("evidence_items")
      .insert({
        package_id: packageId,
        ...item,
        status: "verified"
      })
      .select()
      .single();
    handleError(error);
    return data;
  },

  async getPackage(packageId: string) {
    const { data, error } = await supabase
      .from("evidence_packages")
      .select(`
        *,
        items:evidence_items(*)
      `)
      .eq("id", packageId)
      .single();
    handleError(error);
    return data;
  },

  async getMyPackages() {
    const user = await auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("evidence_packages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    handleError(error);
    return data || [];
  }
};

// 10. AI 인테리어 생성
export const aiInterior = {
  async generate(imageUrl: string, style: string, prompt?: string) {
    const user = await auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");

    const { data, error } = await supabase.functions.invoke("generate-interior", {
      body: { imageUrl, style, prompt }
    });

    if (error) throw error;
    return data;
  },

  async getMyGenerations() {
    const user = await auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("ai_generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    handleError(error);
    return data || [];
  }
};

import { supabase } from "@/integrations/supabase/client";

// 모의 API. 나중에 서버로 교체 가능
const delay = (ms=200)=>new Promise(r=>setTimeout(r, ms))
const get = (k,d)=>JSON.parse(localStorage.getItem(k)||JSON.stringify(d))
const set = (k,v)=>localStorage.setItem(k,JSON.stringify(v))

export const auth = {
  async signup({name,email,password}) {
    await delay()
    const users=get('users',[])
    if(users.find(u=>u.email===email)) throw new Error('이미 존재하는 이메일')
    const user={id:Date.now(),name,email,password}
    users.push(user); set('users',users); set('session',{id:user.id})
    return {user}
  },
  async login({email,password}) {
    await delay()
    const u=get('users',[]).find(u=>u.email===email&&u.password===password)
    if(!u) throw new Error('이메일/비밀번호 오류')
    set('session',{id:u.id}); return {user:u}
  },
  async me(){ await delay(100); const s=get('session',null); const u=get('users',[]).find(x=>x.id===s?.id); return {user:u} },
  async logout(){ localStorage.removeItem('session') }
}

export const contracts={
  async saveAnalysis(data){const arr=get('contractHistory',[]);arr.unshift({...data,id:Date.now()});set('contractHistory',arr)},
  async history(){return {items:get('contractHistory',[])}},
  async remove(id){set('contractHistory',get('contractHistory',[]).filter(x=>x.id!==id))}
}

const partnersDB=[
  {id:1,name:'블루하우스',city:'서울',category:'화이트톤',rating:4.7,phone:'010-1111-1111'},
  {id:2,name:'우드앤무드',city:'수원',category:'우드 포인트',rating:4.6,phone:'010-2222-2222'},
  {id:3,name:'모던키친',city:'인천',category:'모던 주방',rating:4.8,phone:'010-3333-3333'},
  {id:4,name:'그레이룸',city:'안산',category:'라이트 그레이',rating:4.5,phone:'010-4444-4444'},
  {id:5,name:'내추럴베이지',city:'시흥',category:'내추럴 베이지',rating:4.4,phone:'010-5555-5555'},
  {id:6,name:'프레시엔트런스',city:'광명',category:'산뜻한 현관',rating:4.3,phone:'010-6666-6666'},
]
export const partners={
  async listByCategory(cat){return {items:partnersDB.filter(p=>p.category===cat)}},
  async match({city,minRating=0}){return {items:partnersDB.filter(p=>(!city||p.city===city)&&p.rating>=minRating)}},
  
  // 파트너 신청 (Supabase 연동)
  async apply(formData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");

    // 이미 신청했는지 확인
    const { data: existing } = await supabase
      .from("partners")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existing) throw new Error("이미 파트너 신청이 접수되었습니다.");

    const { error } = await supabase.from("partners").insert({
      user_id: user.id,
      business_name: formData.companyName || formData.business_name,
      phone: formData.phone,
      email: formData.email,
      category: formData.category,
      description: formData.introduction || formData.description,
      business_license: formData.license || formData.business_license,
      portfolio_images: formData.portfolio_images || [],
      status: "pending"
    });

    if (error) throw error;
    return { ok: true };
  }
}

const scamDB=[
  {id:1,name:'홍사기',phone:'010-9999-9999',license:'미보유',cases:3,note:'선금 전액 요구'},
  {id:2,name:'김트릭',phone:'010-8888-7777',license:'불명',cases:2,note:'검수 전 잔금 요청'}
]
export const scammers={
  async search({name,phone,license}){return {items:scamDB.filter(s=>(!name||s.name.includes(name))&&(!phone||s.phone.includes(phone))&&(!license||(s.license||'').includes(license))) }}
}

// 계약 및 에스크로 관리
export const contractManagement = {
  async create(contract) {
    await delay()
    const contracts = get('contracts', [])
    const newContract = {
      ...contract,
      id: Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    contracts.push(newContract)
    set('contracts', contracts)
    return { contract: newContract }
  },
  async list() {
    await delay()
    return { items: get('contracts', []) }
  },
  async getById(id) {
    await delay()
    const contract = get('contracts', []).find(c => c.id === id)
    return { contract }
  },
  async updateStatus(id, status) {
    await delay()
    const contracts = get('contracts', [])
    const index = contracts.findIndex(c => c.id === id)
    if (index !== -1) {
      contracts[index].status = status
      set('contracts', contracts)
      return { contract: contracts[index] }
    }
    throw new Error('계약을 찾을 수 없습니다')
  }
}

export const escrow = {
  async deposit({ contractId, amount, type }) {
    await delay()
    const payments = get('escrowPayments', [])
    const payment = {
      id: Date.now(),
      contractId,
      amount,
      type,
      status: 'held',
      createdAt: new Date().toISOString()
    }
    payments.push(payment)
    set('escrowPayments', payments)
    return { payment }
  },
  async getByContract(contractId) {
    await delay()
    return { items: get('escrowPayments', []).filter(p => p.contractId === contractId) }
  },
  async release(paymentId) {
    await delay()
    const payments = get('escrowPayments', [])
    const index = payments.findIndex(p => p.id === paymentId)
    if (index !== -1) {
      payments[index].status = 'released'
      payments[index].releasedAt = new Date().toISOString()
      set('escrowPayments', payments)
      return { payment: payments[index] }
    }
    throw new Error('결제를 찾을 수 없습니다')
  },
  async refund(paymentId) {
    await delay()
    const payments = get('escrowPayments', [])
    const index = payments.findIndex(p => p.id === paymentId)
    if (index !== -1) {
      payments[index].status = 'refunded'
      payments[index].refundedAt = new Date().toISOString()
      set('escrowPayments', payments)
      return { payment: payments[index] }
    }
    throw new Error('결제를 찾을 수 없습니다')
  }
}

// 증빙 패키지 API (Supabase 연동)
export const evidence = {
  async createPackage(data) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");

    const { data: pkg, error } = await supabase
      .from("evidence_packages")
      .insert({
        user_id: user.id,
        project_name: data.name,
        contractor_name: data.contractor
      })
      .select()
      .single();

    if (error) throw error;
    return pkg;
  },

  async addItem(packageId, item) {
    const { data, error } = await supabase
      .from("evidence_items")
      .insert({
        package_id: packageId,
        type: item.type,
        title: item.title,
        file_url: item.file_url,
        status: "verified"
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getPackage(packageId) {
    const { data, error } = await supabase
      .from("evidence_packages")
      .select(`*, items:evidence_items(*)`)
      .eq("id", packageId)
      .single();
    if (error) throw error;
    return data;
  },

  async listPackages() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");

    const { data, error } = await supabase
      .from("evidence_packages")
      .select(`*, items:evidence_items(*)`)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
}

// AI 인테리어 API
export const aiInterior = {
  async generate(imageUrl, style, prompt) {
    const { data, error } = await supabase.functions.invoke('generate-interior', {
      body: { image: imageUrl, style, prompt }
    });

    if (error) throw error;
    return data;
  }
}

// 관리자용 견적 문의 API
export const adminEstimates = {
  // 모든 견적 문의 조회 (관리자용)
  async getAllRequests() {
    const { data, error } = await supabase
      .from("estimate_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { items: data || [] };
  },

  // 상태 변경 (예: 상담완료 처리)
  async updateStatus(id, status) {
    const { error } = await supabase
      .from("estimate_requests")
      .update({ status })
      .eq("id", id);
      
    if (error) throw error;
  }
}

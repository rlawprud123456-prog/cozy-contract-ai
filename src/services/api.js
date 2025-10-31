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
  async apply(f){const x=get('apps',[]);x.push(f);set('apps',x);return {ok:true}}
}

const scamDB=[
  {id:1,name:'홍사기',phone:'010-9999-9999',license:'미보유',cases:3,note:'선금 전액 요구'},
  {id:2,name:'김트릭',phone:'010-8888-7777',license:'불명',cases:2,note:'검수 전 잔금 요청'}
]
export const scammers={
  async search({name,phone,license}){return {items:scamDB.filter(s=>(!name||s.name.includes(name))&&(!phone||s.phone.includes(phone))&&(!license||(s.license||'').includes(license))) }}
}

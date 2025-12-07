import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Star, MapPin, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 시공 사례 더미 데이터
const CASE_DATA = [
  {
    id: 1,
    title: "30평대 아파트 모던 화이트 리모델링",
    category: "전체 리모델링",
    location: "서울 강남구",
    area: "32평",
    duration: "4주",
    cost: "3,500만원",
    partner: "디자인 스튜디오 숲",
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600",
    ],
    tags: ["모던", "화이트우드", "신혼집"],
  },
  {
    id: 2,
    title: "20평대 원룸 미니멀 인테리어",
    category: "부분 시공",
    location: "서울 마포구",
    area: "18평",
    duration: "2주",
    cost: "1,200만원",
    partner: "공간을 그리다",
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600",
    ],
    tags: ["미니멀", "원룸", "수납"],
  },
  {
    id: 3,
    title: "욕실 + 주방 부분 리모델링",
    category: "부분 시공",
    location: "경기 성남시",
    area: "25평",
    duration: "10일",
    cost: "800만원",
    partner: "어반 인테리어",
    rating: 5.0,
    images: [
      "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=600",
    ],
    tags: ["욕실", "주방", "부분시공"],
  },
  {
    id: 4,
    title: "빈티지 감성 카페 인테리어",
    category: "상업공간",
    location: "서울 성수동",
    area: "40평",
    duration: "6주",
    cost: "5,000만원",
    partner: "어반 인테리어",
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&q=80&w=600",
    ],
    tags: ["카페", "빈티지", "상업공간"],
  },
  {
    id: 5,
    title: "40평대 아파트 클래식 스타일",
    category: "전체 리모델링",
    location: "서울 송파구",
    area: "42평",
    duration: "5주",
    cost: "4,800만원",
    partner: "디자인 스튜디오 숲",
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=600",
    ],
    tags: ["클래식", "고급", "대형평수"],
  },
  {
    id: 6,
    title: "신혼부부 25평 아파트 인테리어",
    category: "전체 리모델링",
    location: "인천 송도",
    area: "25평",
    duration: "3주",
    cost: "2,200만원",
    partner: "공간을 그리다",
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=600",
    ],
    tags: ["신혼집", "모던", "실용적"],
  },
];

const CATEGORIES = ["전체", "전체 리모델링", "부분 시공", "상업공간"];

export default function Cases() {
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const filteredCases = CASE_DATA.filter((item) => {
    const matchesKeyword = item.title.includes(keyword) || 
                          item.partner.includes(keyword) || 
                          item.tags.some(tag => tag.includes(keyword));
    const matchesCategory = selectedCategory === "전체" || item.category === selectedCategory;
    return matchesKeyword && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <div className="bg-white px-4 py-6 border-b sticky top-0 z-40">
        <h1 className="text-xl font-bold text-slate-900 mb-4">시공 사례</h1>
        
        {/* 검색 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            className="pl-9 bg-gray-50 border-gray-200" 
            placeholder="스타일, 지역, 업체명 검색" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {/* 카테고리 탭 */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 gap-2">
            {CATEGORIES.map((cat) => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="px-4 py-2 rounded-full data-[state=active]:bg-slate-900 data-[state=active]:text-white border"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 결과 카운트 */}
      <div className="px-4 py-3 text-sm text-gray-500">
        총 <span className="font-bold text-slate-900">{filteredCases.length}</span>건의 시공 사례
      </div>

      {/* 시공 사례 리스트 */}
      <div className="px-4 space-y-4">
        {filteredCases.map((item) => (
          <Link 
            key={item.id} 
            to={`/cases/${item.id}`}
            className="block bg-white rounded-xl shadow-sm overflow-hidden border hover:shadow-md transition-shadow"
          >
            {/* 이미지 슬라이드 */}
            <div className="flex overflow-x-auto scrollbar-hide">
              {item.images.map((img, idx) => (
                <div key={idx} className="shrink-0 w-full aspect-[16/10]">
                  <img src={img} alt={item.title} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* 콘텐츠 */}
            <div className="p-4">
              {/* 태그 */}
              <div className="flex gap-1 mb-2 flex-wrap">
                {item.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0.5">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* 제목 */}
              <h3 className="font-bold text-base text-slate-900 mb-2 line-clamp-1">
                {item.title}
              </h3>

              {/* 정보 */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />{item.location}
                </span>
                <span>{item.area}</span>
                <span>{item.duration}</span>
                <span className="font-bold text-slate-900">{item.cost}</span>
              </div>

              {/* 시공사 정보 */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">
                      {item.partner.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item.partner}</span>
                </div>
                <div className="flex items-center text-yellow-500 text-sm font-bold">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  {item.rating}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface ProfileProps {
  user: any;
}

export default function Profile({ user }: ProfileProps) {
  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-3 sm:p-4">
      <div className="container mx-auto max-w-4xl py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6">내 프로필</h1>
        
        <Card className="shadow-[var(--shadow-card)] mb-4 sm:mb-6">
          <CardHeader className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base sm:text-lg">{user?.name || "사용자"}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{user?.email || "email@example.com"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 md:p-6">
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-sm sm:text-base">프로필 수정</Button>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="p-4 sm:p-5 md:p-6">
            <CardTitle className="text-base sm:text-lg">내 계약 검토 이력</CardTitle>
            <CardDescription className="text-xs sm:text-sm">최근 검토한 계약서 목록</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 md:p-6">
            <Link to="/history">
              <Button variant="outline" className="w-full text-sm sm:text-base">검토 이력 보기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface ProfileProps {
  user: any;
}

export default function Profile({ user }: ProfileProps) {
  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <h1 className="text-3xl font-bold text-primary mb-6">내 프로필</h1>
        
        <Card className="shadow-[var(--shadow-card)] mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user?.name || "사용자"}</CardTitle>
                <CardDescription>{user?.email || "email@example.com"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="bg-primary hover:bg-primary/90">프로필 수정</Button>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>내 계약 검토 이력</CardTitle>
            <CardDescription>최근 검토한 계약서 목록</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/history">
              <Button variant="outline" className="w-full">검토 이력 보기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

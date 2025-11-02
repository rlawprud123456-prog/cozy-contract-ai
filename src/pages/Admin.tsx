import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Briefcase, FileText, Shield } from "lucide-react";

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        toast({
          title: "접근 권한 없음",
          description: "관리자만 접근할 수 있습니다.",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await loadData();
    } catch (error) {
      console.error("Admin access check error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [usersRes, partnersRes, contractsRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("partners").select("*"),
        supabase.from("contracts").select("*")
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (partnersRes.data) setPartners(partnersRes.data);
      if (contractsRes.data) setContracts(contractsRes.data);
    } catch (error) {
      console.error("Data loading error:", error);
    }
  };

  const updatePartnerStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("partners")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "상태 업데이트 완료",
        description: `파트너 상태가 ${status}로 변경되었습니다.`
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "업데이트 실패",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">관리자 대시보드</h1>
          </div>
          <p className="text-muted-foreground">플랫폼 전체 데이터를 관리합니다</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">파트너</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partners.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">계약</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contracts.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="partners">파트너 관리</TabsTrigger>
            <TabsTrigger value="contracts">계약 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{user.name || "이름 없음"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        가입일: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {users.length === 0 && (
              <p className="text-center text-muted-foreground py-12">등록된 사용자가 없습니다</p>
            )}
          </TabsContent>

          <TabsContent value="partners" className="space-y-4">
            {partners.map((partner) => (
              <Card key={partner.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-foreground">{partner.business_name}</p>
                        <Badge variant={partner.status === 'approved' ? 'default' : 'secondary'}>
                          {partner.status === 'approved' ? '승인됨' : partner.status === 'rejected' ? '거절됨' : '대기중'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{partner.email}</p>
                      <p className="text-sm text-muted-foreground">{partner.phone}</p>
                      <p className="text-xs text-muted-foreground mt-1">카테고리: {partner.category}</p>
                    </div>
                    <div className="flex gap-2">
                      {partner.status !== 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => updatePartnerStatus(partner.id, 'approved')}
                        >
                          승인
                        </Button>
                      )}
                      {partner.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updatePartnerStatus(partner.id, 'rejected')}
                        >
                          거절
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {partners.length === 0 && (
              <p className="text-center text-muted-foreground py-12">등록된 파트너가 없습니다</p>
            )}
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            {contracts.map((contract) => (
              <Card key={contract.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-foreground">{contract.title}</p>
                        <Badge>{contract.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{contract.description}</p>
                      {contract.amount && (
                        <p className="text-sm font-medium mt-1">
                          금액: {Number(contract.amount).toLocaleString()}원
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        생성일: {new Date(contract.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {contracts.length === 0 && (
              <p className="text-center text-muted-foreground py-12">등록된 계약이 없습니다</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

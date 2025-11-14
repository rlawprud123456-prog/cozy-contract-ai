import { LayoutDashboard, Users, Briefcase, FileText, Calculator, DollarSign, Shield, Star } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "대시보드", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "사용자 관리", url: "/admin/users", icon: Users },
  { title: "파트너 관리", url: "/admin/partners", icon: Briefcase },
  { title: "계약 관리", url: "/admin/contracts", icon: FileText },
  { title: "견적 요청", url: "/admin/estimates", icon: Calculator },
  { title: "에스크로 결제", url: "/admin/payments", icon: DollarSign },
  { title: "피해 신고", url: "/admin/damage-reports", icon: Shield },
  { title: "이달의 전문가", url: "/admin/featured", icon: Star },
];

export function AdminSidebar() {
  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>관리자 메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.end}
                      className={({ isActive }) => 
                        isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
                      }
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

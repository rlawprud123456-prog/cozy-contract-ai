import { ReactNode } from "react";

interface AppPageProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  maxWidth?: "md" | "lg" | "xl";
  headerRight?: ReactNode;
  children: ReactNode;
}

const maxWidthClassMap: Record<NonNullable<AppPageProps["maxWidth"]>, string> = {
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

export function AppPage({
  title,
  description,
  icon,
  maxWidth = "lg",
  headerRight,
  children,
}: AppPageProps) {
  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-b from-background to-secondary/30 px-4 py-6">
      <div className={`container mx-auto ${maxWidthClassMap[maxWidth]} space-y-6`}>
        
        {/* 헤더 */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {icon}
              <h1 className="text-2xl md:text-3xl font-bold text-primary">{title}</h1>
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          {headerRight && (
            <div className="flex-shrink-0 flex justify-end items-center">
              {headerRight}
            </div>
          )}
        </header>

        {/* 본문 */}
        <main className="space-y-4">{children}</main>
      </div>
    </div>
  );
}

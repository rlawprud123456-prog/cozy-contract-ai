import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

export interface StatItem {
  label: string;
  value: string | number;
  subText?: string;
  icon?: ReactNode;
}

interface StatsGridProps {
  items: StatItem[];
  cols?: 2 | 3 | 4;
}

export function StatsGrid({ items, cols = 3 }: StatsGridProps) {
  const gridClassMap = {
    2: "grid grid-cols-1 md:grid-cols-2 gap-4",
    3: "grid grid-cols-1 md:grid-cols-3 gap-4",
    4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
  };

  return (
    <div className={gridClassMap[cols]}>
      {items.map((item, idx) => (
        <Card 
          key={idx} 
          className="shadow-[var(--shadow-card)] hover:shadow-lg transition-shadow"
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              {item.icon && (
                <div className="text-accent opacity-70">
                  {item.icon}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-1 pt-0">
            <span className="text-2xl font-bold">{item.value}</span>
            {item.subText && (
              <span className="text-xs text-muted-foreground">{item.subText}</span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

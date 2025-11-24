import { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface SectionCardProps {
  title?: string;
  description?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  headerRight,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <Card className={`shadow-[var(--shadow-card)] hover:shadow-lg transition-shadow ${className}`}>
      {(title || description || headerRight) && (
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pb-3">
          <div className="flex-1">
            {title && (
              <CardTitle className="text-lg font-semibold">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-sm mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          {headerRight && (
            <div className="flex-shrink-0 flex items-center">
              {headerRight}
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
}

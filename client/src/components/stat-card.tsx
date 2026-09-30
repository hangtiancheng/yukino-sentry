import type { ComponentType, ReactNode } from "react";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ComponentType<{ className?: string }>;
  hint?: ReactNode;
}

export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <Card className="gap-2 py-4">
      <CardHeader className="px-4">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        <CardAction>
          <Icon className="text-muted-foreground size-4" />
        </CardAction>
        {hint ? (
          <div className="text-muted-foreground text-xs">{hint}</div>
        ) : null}
      </CardHeader>
    </Card>
  );
}

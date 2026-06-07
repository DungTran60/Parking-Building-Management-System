import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/common/Card";

export function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent className="h-80">{children}</CardContent>
    </Card>
  );
}

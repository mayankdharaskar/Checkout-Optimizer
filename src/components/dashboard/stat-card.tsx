import { Card, CardTitle, CardValue } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string;
  hint?: string;
};

export function StatCard({ title, value, hint }: StatCardProps) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardValue>{value}</CardValue>
      {hint ? <p className="mt-2 text-sm text-zinc-500">{hint}</p> : null}
    </Card>
  );
}

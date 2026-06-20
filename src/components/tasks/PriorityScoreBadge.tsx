import { Badge } from "@/components/ui/Badge";

interface PriorityScoreBadgeProps {
  score: number;
  label?: string;
}

export function PriorityScoreBadge({ score, label = "Min Priority" }: PriorityScoreBadgeProps) {
  const tone = score >= 85 ? "red" : score >= 70 ? "purple" : score >= 50 ? "blue" : "gray";
  return <Badge tone={tone}>{label}: {score}/100</Badge>;
}

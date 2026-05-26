import { buildComparativeTimeline } from "@/lib/timeline-comparativo";
import TimelineComparativo from "@/components/TimelineComparativo";

export default async function TimelineComparativoPage() {
  const data = await buildComparativeTimeline();
  return (
    <TimelineComparativo
      chars={data.chars}
      yearMin={data.yearMin}
      yearMax={data.yearMax}
    />
  );
}

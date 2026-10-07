import { RecentScansSection } from "@/components/recent-scans";
import { SessionActions } from "@/components/session/session-actions";
import { SessionSummaryCard } from "@/components/session/session-summary-card";
import { TabScreen } from "@/components/tab-screen";
import { undoLastScan, useDepositSession } from "@/lib/deposit-session";
import { router } from "expo-router";

export default function CounterScreen() {

  const { summary, latest, previous } = useDepositSession();

  return (
    <TabScreen title="Aktuelle Abgabe">
      <SessionSummaryCard summary={summary} />
      <RecentScansSection latest={latest} previous={previous.slice(0, 3)} onUndo={undoLastScan} />
      <SessionActions onAddCrate={() => router.push("/add-crate")} onFinish={() => router.push("/submission-preparation")} finishDisabled={!latest} />
    </TabScreen>
  );
}

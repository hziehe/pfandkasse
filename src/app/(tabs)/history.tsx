import { HistoryFilter, HistorySection, HistoryStats } from "@/components/history";
import { TabScreen } from "@/components/tab-screen";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { groupDeposits, matchesFilter, summarizeHistory, useDepositHistory, type DepositFilter } from "@/lib/deposit-history";
import { useNow } from "@/lib/deposit-session";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function HistoryScreen() {

  const theme = useTheme();
  const history = useDepositHistory();
  const now = useNow(60_000);
  const [filter, setFilter] = useState<DepositFilter>("alle");

  const stats = useMemo(() => summarizeHistory(history, now), [history, now]);
  const groups = useMemo(() => groupDeposits(history.filter((record) => matchesFilter(record, filter)), now), [history, filter, now]);

  return (
    <TabScreen title="Verlauf">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HistoryStats stats={stats} now={now} />
        <HistoryFilter value={filter} onChange={setFilter} />
        {groups.length === 0 &&
          <ThemedText style={[styles.empty, { color: theme.textSecondary }]}>
            {history.length === 0 ? "Noch keine Abgaben gespeichert. Schließe eine Abgabe im Zähler ab, um sie hier zu sehen." : "Keine Abgaben für diesen Filter."}
          </ThemedText>
        }
        {groups.map((group) => <HistorySection key={group.key} group={group} />)}
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
    paddingBottom: Spacing.four
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.two
  }
});

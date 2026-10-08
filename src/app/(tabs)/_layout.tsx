import AppTabs from "@/components/app-tabs";
import { useReminderResponse } from "@/lib/deposit-reminder";

export default function TabLayout() {

  useReminderResponse();

  return <AppTabs />;
}

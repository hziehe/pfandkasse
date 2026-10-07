import { preloadAssetImages } from "@/constants/images";
import { isOnboardingCompleted } from "@/lib/onboarding";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

export default function Index() {

  const [done, setDone] = useState<boolean | null>(null);

  useEffect(() => {
    isOnboardingCompleted().then(async (completed) => {
      if (!completed) await preloadAssetImages().catch(() => {});
      setDone(completed);
    }).finally(() => SplashScreen.hideAsync());
  }, []);

  if (done === null) return null;
  return <Redirect href={done ? "/counter" : "/onboarding"} />;
}

import type { Metadata } from "next";
import { LaunchConsole } from "@/components/admin/launch-console";

export const metadata: Metadata = {
  title: "Launch · solsjin admin",
  robots: { index: false, follow: false },
};

/** Static shell. All data and auth go through /api/admin/*, so the secret never reaches the client. */
export default function AdminLaunchPage() {
  return <LaunchConsole />;
}

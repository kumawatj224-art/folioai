import { redirect } from "next/navigation";

import { isNewAppEnabled } from "@/lib/env/feature-flags";

export default function RootPage() {
  if (!isNewAppEnabled()) {
    redirect("/index.html");
  }

  redirect("/mvp1-preview");
}

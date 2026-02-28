import { Suspense } from "react";
import { HomePage } from "@/interface/features/home";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <HomePage />
    </Suspense>
  );
}

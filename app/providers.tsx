"use client";

import { Suspense } from "react";
import { YouVersionProvider } from "@youversion/platform-react-ui";
import { QueryParamsProvider } from "@/components/query-params-provider";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <QueryParamsProvider>
        <YouVersionProvider
          appKey={process.env.BIBLE_API_KEY!}
          includeAuth={true}
          authRedirectUrl={process.env.NEXT_PUBLIC_REDIRECT_URI!}
        >
          {children}
        </YouVersionProvider>
        <Toaster closeButton richColors position="top-center" />
      </QueryParamsProvider>
    </Suspense>
  );
}

import { Suspense } from "react";
import SearchContent from "./SearchContent";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-16 text-center text-text-secondary">
          Searching...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

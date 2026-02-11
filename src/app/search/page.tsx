import { Metadata } from "next";
import { Suspense } from "react";
import SearchContent from "./SearchContent";

export const metadata: Metadata = {
  title: "Search Services",
  description:
    "Search for private service providers in Switzerland. Filter by service type, location, and distance to find the right person near you.",
};

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

import { Suspense } from "react";
import MessagesContent from "./MessagesContent";

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-16 text-center text-text-secondary">
          Loading messages...
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}

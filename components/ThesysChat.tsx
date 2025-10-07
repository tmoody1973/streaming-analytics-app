"use client";

import { C1Chat } from "@thesysai/genui-sdk";

export function ThesysChat() {
  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden">
      <C1Chat
        apiUrl="/api/chat"
        formFactor="side-panel"
        agentName="Radio Analytics AI"
        logoUrl="/images/RadioMilwaukeeLogos_HorizontalLockup_CreamOrange.png"
        scrollVariant="user-message-anchor"
      />
    </div>
  );
}

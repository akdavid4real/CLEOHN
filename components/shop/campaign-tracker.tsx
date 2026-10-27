"use client";

import { useEffect } from "react";
import { storeAttribution } from "@/lib/attribution";
import type { Attribution } from "@/lib/attribution";

interface CampaignTrackerProps {
  attribution: Attribution;
}

export function CampaignTracker({ attribution }: CampaignTrackerProps) {
  const serialized = JSON.stringify(attribution);

  useEffect(() => {
    storeAttribution(JSON.parse(serialized) as Attribution);
  }, [serialized]);

  return null;
}

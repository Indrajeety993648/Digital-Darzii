"use client";
import { useState, useEffect, useRef } from "react";

export interface GenerationStatus {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  processingStage: string | null;
  resultImageUrl: string | null;
  clothingImageUrl: string;
  processingTimeMs: number | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

const POLL_INTERVAL = 2000; // 2 seconds

export function useGenerationStatus(id: string) {
  const [data, setData] = useState<GenerationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/status/${id}`);
        if (!res.ok) throw new Error("Failed to fetch status");
        const status: GenerationStatus = await res.json();
        setData(status);
        setIsLoading(false);

        // Stop polling when done
        if (status.status === "completed" || status.status === "failed") {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (err) {
        setError(String(err));
        setIsLoading(false);
      }
    };

    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id]);

  const isPolling = data?.status === "queued" || data?.status === "processing";

  return { data, isLoading, error, isPolling };
}

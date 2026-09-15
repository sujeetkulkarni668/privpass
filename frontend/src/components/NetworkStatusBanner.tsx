import React from "react";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

export const NetworkStatusBanner: React.FC = () => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="bg-rose-600 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 shadow-md">
      <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9 9 0 01-5.657-2.829m0 0l2.829-2.829M3 3l18 18"
        />
      </svg>
      <span>You are currently offline. Zero-knowledge proof submissions require an active network connection.</span>
    </div>
  );
};

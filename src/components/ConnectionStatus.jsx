import { WifiOff, RefreshCw } from "lucide-react";

export default function ConnectionStatus({ status }) {
  if (status === "idle") return null;

  return (
    <div className={`connection-status ${status}`}>
      {status === "offline" && (
        <>
          <WifiOff size={14} />
          <span>Offline — changes will sync when connected</span>
        </>
      )}
      {status === "syncing" && (
        <>
          <RefreshCw size={14} className="spin" />
          <span>Syncing...</span>
        </>
      )}
    </div>
  );
}

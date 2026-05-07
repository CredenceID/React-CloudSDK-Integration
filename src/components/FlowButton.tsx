import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { CloudSDKError } from "@/api/types/cloudSDKService";

export interface FlowButtonProps {
  label: string;
  icon?: ReactNode;
  /** Async function that runs the full flow. Throw to signal failure. */
  onRun: () => Promise<unknown>;
  /** Called with the resolved value of onRun on success. */
  onResult?: (data: unknown) => void;
  disabled?: boolean;
}

function Spinner() {
  return (
    <svg
      className="flow-spinner"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

export function FlowButton({
  label,
  icon,
  onRun,
  onResult,
  disabled,
}: FlowButtonProps) {
  const [isRunning, setIsRunning] = useState(false);

  const handleClick = async () => {
    setIsRunning(true);
    try {
      const result = await onRun();
      onResult?.(result);
    } catch (err) {
      const axiosError = err as AxiosError<CloudSDKError>;
      toast.error(
        axiosError.response?.data?.message ??
          (err instanceof Error ? err.message : "Flow failed."),
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <button
      className={`flow-btn${isRunning ? " flow-btn--running" : ""}`}
      onClick={handleClick}
      disabled={disabled || isRunning}
      aria-busy={isRunning}
    >
      <span className="flow-btn-icon">{isRunning ? <Spinner /> : icon}</span>
      <span className="flow-btn-label">{isRunning ? "Running…" : label}</span>
    </button>
  );
}

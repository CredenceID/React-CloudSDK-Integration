import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { CloudSDKError } from "@/api/types/cloudSDKService";

export interface FlowButtonProps {
  label: string;
  subtitle?: string;
  icon?: ReactNode;
  onRun: () => Promise<unknown>;
  onResult?: (data: unknown) => void;
  onStart?: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

function Spinner() {
  return (
    <svg
      className="flow-spinner"
      width="20"
      height="20"
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
  subtitle,
  icon,
  onRun,
  onResult,
  onStart,
  isActive,
  disabled,
}: FlowButtonProps) {
  const [isRunning, setIsRunning] = useState(false);

  const handleClick = async () => {
    onStart?.();
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
      className={`flow-btn-card${isRunning ? " flow-btn-card--running" : ""}${isActive ? " flow-btn-card--active" : ""}`}
      onClick={handleClick}
      disabled={disabled || isRunning}
      aria-busy={isRunning}
    >
      {isActive && <span className="flow-btn-card-dot" aria-hidden="true" />}
      <span className="flow-btn-card-icon">
        {isRunning ? <Spinner /> : icon}
      </span>
      <span className="flow-btn-card-text">
        <span className="flow-btn-card-title">
          {isRunning ? "Running…" : label}
        </span>
        {subtitle && !isRunning && (
          <span className="flow-btn-card-subtitle">{subtitle}</span>
        )}
      </span>
    </button>
  );
}

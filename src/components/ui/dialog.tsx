import React, { useState, useCallback } from "react";

interface DialogProps {
  children: React.ReactNode;
}

export function Dialog({ children }: DialogProps) {
  return <>{children}</>;
}

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function DialogTrigger({ children }: DialogTriggerProps) {
  return <>{children}</>;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogContent({ children, className = "" }: DialogContentProps) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4`}>
      <div className={`rounded-2xl shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-md w-full p-4 text-left ${className}`}>
        {children}
      </div>
    </div>
  );
}

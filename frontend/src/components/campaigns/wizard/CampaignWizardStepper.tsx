import React from "react";
import { Check } from "lucide-react";

interface CampaignWizardStepperProps {
  currentStep: number;
  maxStepReached: number;
  onStepClick: (step: number) => void;
}

export const CampaignWizardStepper: React.FC<CampaignWizardStepperProps> = ({
  currentStep,
  maxStepReached,
  onStepClick,
}) => {
  const steps = [
    { num: 1, label: "Channel" },
    { num: 2, label: "Audience" },
    { num: 3, label: "Template" },
    { num: 4, label: "Schedule" },
    { num: 5, label: "Review" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto py-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-8 right-8 top-4 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />

        {steps.map((s) => {
          const isCompleted =
            s.num < currentStep || (maxStepReached >= s.num && currentStep !== s.num);
          const isCurrent = currentStep === s.num;
          const isClickable = s.num <= maxStepReached;

          return (
            <div
              key={s.num}
              onClick={() => {
                if (isClickable) onStepClick(s.num);
              }}
              className={`flex flex-col items-center gap-1.5 relative z-10 select-none ${
                isClickable ? "cursor-pointer" : "cursor-default opacity-60"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full font-medium text-xs transition-all duration-150 ${
                  isCurrent
                    ? "bg-slate-900 text-white shadow-xs"
                    : isCompleted
                    ? "bg-slate-100 text-slate-800 border border-slate-300"
                    : "bg-white border border-slate-200 text-slate-400"
                }`}
              >
                {isCompleted && !isCurrent ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : s.num}
              </div>
              <span
                className={`text-xs ${
                  isCurrent
                    ? "font-semibold text-slate-900"
                    : isCompleted
                    ? "font-medium text-slate-700"
                    : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

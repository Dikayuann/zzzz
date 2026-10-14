import React from "react";
import { Users } from "lucide-react";
import type { DeliveryChannel, AudienceOption } from "@/types/campaignWizard";

interface StepAudienceProps {
  selectedAudience: string;
  onSelectAudience: (id: string) => void;
  selectedChannels: DeliveryChannel[];
  audienceOptions: AudienceOption[];
}

export const StepAudience: React.FC<StepAudienceProps> = ({
  selectedAudience,
  onSelectAudience,
  selectedChannels,
  audienceOptions,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          Pilih Target Audiens
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Pesan akan dikirimkan ke kontak pada segmen yang memiliki data sesuai saluran terpilih ({selectedChannels.join(", ")}).
        </p>
      </div>

      <div className="space-y-3">
        {audienceOptions.map((aud) => {
          const isSelected = selectedAudience === aud.id;

          return (
            <div
              key={aud.id}
              onClick={() => onSelectAudience(aud.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? "border-[#0284c7] bg-sky-50/20 shadow-xs"
                  : "border-slate-200/80 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isSelected
                      ? "bg-[#0284c7] text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-900">
                      {aud.name}
                    </h4>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {aud.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{aud.desc}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-sm text-slate-900 block font-mono">
                  {aud.count.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">kontak valid</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

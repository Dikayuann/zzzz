import React from "react";
import type { AuditLogItem } from "@/types/account";

interface AuditLogTabProps {
  logs: AuditLogItem[];
}

export const AuditLogTab: React.FC<AuditLogTabProps> = ({ logs }) => {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
              <th className="py-4 pl-6 pr-4 min-w-[280px]">ACTION / EVENT</th>
              <th className="py-4 px-4 min-w-[140px]">ACTOR</th>
              <th className="py-4 px-4 min-w-[120px]">IP ADDRESS</th>
              <th className="py-4 px-4 min-w-[140px]">TIMESTAMP</th>
              <th className="py-4 pr-6 pl-4 text-right min-w-[100px]">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 pl-6 pr-4 font-semibold text-slate-800">
                  {item.action}
                </td>
                <td className="py-3.5 px-4 text-slate-600 font-medium">
                  {item.actor}
                </td>
                <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                  {item.ip}
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  {item.timestamp}
                </td>
                <td className="py-3.5 pr-6 pl-4 text-right">
                  {item.status === "Success" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Warning
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

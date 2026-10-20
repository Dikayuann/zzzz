import React from "react";
import { Folder, X } from "lucide-react";
import type { ContactList } from "@/types/contact";

interface ContactListSelectorProps {
  lists: ContactList[];
  selectedList: string;
  onSelectList: (id: string) => void;
  totalContacts: number;
  onDeleteList?: (id: string, name: string) => void;
}

export const ContactListSelector: React.FC<ContactListSelectorProps> = ({
  lists,
  selectedList,
  onSelectList,
  totalContacts,
  onDeleteList,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      {lists.map((l) => {
        const count =
          l.id === "all"
            ? totalContacts
            : (l.contactCount ?? 0);
        const isSelected = selectedList === l.id;
        const isCustomList = l.id !== "all";

        return (
          <div
            key={l.id}
            onClick={() => onSelectList(l.id)}
            className={`group px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap active:scale-95 select-none ${
              isSelected
                ? "bg-[#0284c7] text-white shadow-2xs"
                : "bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Folder className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-sky-600"}`} />
            <span>{l.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {count.toLocaleString()}
            </span>

            {/* Tombol Hapus Kategori/List Kustom */}
            {isCustomList && onDeleteList && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteList(l.id, l.name);
                }}
                title={`Hapus kategori "${l.name}"`}
                className={`ml-0.5 p-0.5 rounded-md transition cursor-pointer opacity-70 hover:opacity-100 ${
                  isSelected
                    ? "hover:bg-white/25 text-white"
                    : "hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                }`}
              >
                <X className="h-3 w-3 stroke-[2.5]" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

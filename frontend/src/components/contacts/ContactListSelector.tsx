import React from "react";
import { Folder } from "lucide-react";
import type { ContactItem, ContactList } from "@/types/contact";

interface ContactListSelectorProps {
  lists: ContactList[];
  selectedList: string;
  onSelectList: (id: string) => void;
  contacts: ContactItem[];
}

export const ContactListSelector: React.FC<ContactListSelectorProps> = ({
  lists,
  selectedList,
  onSelectList,
  contacts,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      {lists.map((l) => {
        const count =
          l.id === "all"
            ? contacts.length
            : contacts.filter((c) => c.listId === l.id).length;
        const isSelected = selectedList === l.id;
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => onSelectList(l.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap active:scale-95 ${
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
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

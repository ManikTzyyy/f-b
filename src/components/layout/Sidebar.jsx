"use client";

import {
  Box,
  ArrowLeftFromLineIcon,
  ArrowRightFromLineIcon,
  ScrollText,
  Utensils
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const [expanded, isExpanded] = useState(true);
  const pathname = usePathname();

  const menu = [

    
    {
      label: "Income & Expense",
      icon: ScrollText,
      children: [
        { label: "Sales Order", route: "#" },
        { label: "Purchase Order", route: "#" },
        { label: "Operational", route: "#" },
        
      ],
    },
    {
      label: "Product",
      icon: Utensils,
      children: [
        { label: "Menu", route: "#" },
        { label: "Ingredients Stock", route: "/product/ingredient" },
        
      ],
    },
   
    {
      label: "Master",
      icon: Box,
      children: [
        { label: "Account", route: "/master/account" },
        { label: "Supplier", route: "/master/supplier" },
        { label: "Categories", route: "/master/category" },
        { label: "Roles", route: "/master/role" },
        { label: "Users", route: "/master/user" },
        
      ],
    },
  ];

  return (
    <div
      className={`bg-white rounded-r-lg rounded-br-lg flex flex-col justify-between h-screen max-h-screen sticky top-0 transition-all ease-in-out p-2
    ${expanded ? "min-w-48" : "min-w-0"}
    `}
    >
      <div>
        <div className="min-h-3 pb-2 my-5 text-center">
          {expanded && "F&B Company"}
        </div>
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label}>
              <div className="space-y-0.5">
                <div
                  className={`px-2 pt-5 pb-1 w-full border-b border-stone-200 flex items-center
              ${expanded ? "justify-between" : "justify-center"}
              `}
                >
                  <div className="flex items-center text-start gap-2">
                    <Icon width={15} height={15} />
                    {expanded && <span className="text-sm">{item.label}</span>}
                  </div>
                </div>

                {expanded && (
                  <div className="flex flex-col text-xs gap-1 pl-2 text-stone-400">
                    {item.children?.map((e) => (
                      <Link
                        key={e.label}
                        href={e.route}
                        className={`flex items-center gap-2 rounded-full py-1 px-2 hover:bg-orange-200 ${
                          pathname === e.route ? "bg-orange-500 text-white" : ""
                        }`}
                      >
                        <span className={`w-2 h-2  rounded-full 
                          ${pathname === e.route ? "bg-white":"bg-stone-700"}
                          `}/>
                        {e.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <button
        className="border-t border-slate-200 flex text-sm items-center justify-between gap-1 px-2 py-2"
        onClick={() => {
          isExpanded(!expanded);
        }}
      >
        {expanded && <span>Collapse</span>}

        {expanded ? (
          <ArrowLeftFromLineIcon width={15} />
        ) : (
          <ArrowRightFromLineIcon width={15} />
        )}
      </button>
    </div>
  );
}

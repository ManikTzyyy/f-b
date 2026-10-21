import { User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";

import { LogOut } from "lucide-react";

import { useLogout } from "@/hooks/useAuth";

export default function Navbar({ user }) {
  const { logout, loading } = useLogout();
  return (
    <div className="flex justify-end items-center w-full bg-white rounded-lg px-2 py-2">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center gap-4 hover:bg-stone-100 px-2 rounded-lg py-1">
            <div className="flex flex-col items-end">
              <span className="text-sm text-stone-900">
                {user?.name || "-"}
              </span>
              <span className="text-xs text-stone-400">
                {user?.role?.name || "-"}
              </span>
            </div>

            <div className="bg-stone-300 w-8 h-8 flex justify-center items-center rounded-full">
              <User className="text-white text-sm" />
            </div>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48 mt-1 bg-white">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-stone-500 font-normal">
              Account Action
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={logout}
            disabled={loading}
            className="cursor-pointer focus:bg-blue-50 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>{loading ? "Logging out..." : "Log Out"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

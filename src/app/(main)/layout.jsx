import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="flex w-full gap-2">
      <Sidebar />
      <div className="w-full space-y-2 pr-2">
        <Navbar />
        <div className="bg-white rounded-lg p-4 min-h-screen">{children}</div>
      </div>
    </div>
  );
}

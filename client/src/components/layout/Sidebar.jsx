import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Bell,
  Sparkles,
  X,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/consultations", label: "Consultations", icon: Calendar },
  { to: "/follow-ups", label: "Follow-Ups", icon: Bell },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-66 flex-col border-r border-slate-800 bg-slate-950 text-white transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
  <div className="flex items-center gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/20">
      <Sparkles className="h-4.5 w-4.5 text-white" />
    </div>

    <div>
      <h1 className="text-lg font-bold tracking-tight text-white">
        AstroCRM
      </h1>
      <p className="-mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">
        CRM Dashboard
      </p>
    </div>
  </div>

  <button
    type="button"
    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
    onClick={onClose}
    aria-label="Close sidebar"
  >
    <X className="h-5 w-5" />
  </button>
</div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 p-4.5 mt-8">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 relative ${
                  isActive
                    ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-600/15"
                    : "text-slate-400 hover:bg-slate-900/60 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-105 ${isActive ? "text-white" : "text-slate-450 group-hover:text-slate-200"}`}
                  />
                  <span>{label}</span>
                  {isActive && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-white" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

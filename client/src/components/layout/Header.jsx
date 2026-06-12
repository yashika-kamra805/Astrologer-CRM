import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';

export default function Header({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white/95 px-4 shadow-sm shadow-slate-100/30 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 lg:hidden focus:outline-none focus:ring-2 focus:ring-brand-500/10"
          onClick={onMenuClick}
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title && (
          <h1 className="text-base font-bold text-slate-900 sm:text-lg lg:text-xl tracking-tight">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="hidden items-center gap-3 border-r border-slate-100 pr-4 sm:flex">
            <Avatar name={user.name} size="sm" />
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="hover:text-red-600 hover:bg-red-50/50 text-slate-500 font-semibold"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

import { NavLink, Outlet } from 'react-router';
import { cabinetNavLinks } from '@/data/cabinetNav';

export default function CabinetLayout() {
  return (
    <div className="pt-36">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-6 md:px-10">
          <nav
            className="flex flex-wrap gap-x-1 gap-y-0 py-3 md:gap-x-2"
            aria-label="Sous-navigation Cabinet"
          >
            {cabinetNavLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition-colors md:px-3.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

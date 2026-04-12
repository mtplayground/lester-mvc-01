import { Link, NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/boards', label: 'Boards' }
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-shell-background text-slate-900">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="bg-shell-sidebar px-5 py-6 text-slate-100">
          <Link className="mb-8 block text-xl font-semibold tracking-tight text-white" to="/">
            Lester MVC
          </Link>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
            <h1 className="text-lg font-semibold">Project Workspace</h1>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Issue #2</span>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

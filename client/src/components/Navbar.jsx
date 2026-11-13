import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogIn, LogOut, Menu, Sprout, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const links = [['/recommend','Recommendation'],['/disease','Disease AI'],['/advisory','Advisory'],['/marketplace','Marketplace'],['/schemes','Schemes']];
export default function Navbar() {
  const { user, logout } = useAuth(); const navigate = useNavigate(); const [open,setOpen]=useState(false);
  const signOut=()=>{logout();navigate('/');setOpen(false)};
  return <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
      <Link to="/" className="flex items-center gap-2 text-xl font-black tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-700 text-white"><Sprout size={20}/></span>AgriConnect</Link>
      <button className="rounded-lg p-2 md:hidden" onClick={()=>setOpen(!open)} aria-label="Toggle menu">{open?<X/>:<Menu/>}</button>
      <div className="hidden items-center gap-5 md:flex">{links.map(([to,label])=><NavLink key={to} to={to} className={({isActive})=>`text-sm font-semibold ${isActive?'text-emerald-700':'text-slate-600 hover:text-emerald-700'}`}>{label}</NavLink>)}</div>
      <div className="hidden items-center gap-2 md:flex">
        {user ? <><Link to="/dashboard" className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"><LayoutDashboard size={16}/>Dashboard</Link><button onClick={signOut} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"><LogOut size={16}/>Logout</button></> : <Link to="/login" className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"><LogIn size={16}/>Login</Link>}
      </div>
    </nav>
    {open && <div className="border-t bg-white px-4 py-3 md:hidden">{links.map(([to,label])=><NavLink onClick={()=>setOpen(false)} key={to} to={to} className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-700">{label}</NavLink>)}{user?<><Link onClick={()=>setOpen(false)} to="/dashboard" className="block rounded-lg px-3 py-3 text-sm font-semibold">Dashboard</Link><button onClick={signOut} className="block w-full rounded-lg px-3 py-3 text-left text-sm font-semibold">Logout</button></>:<Link onClick={()=>setOpen(false)} to="/login" className="block rounded-lg bg-emerald-700 px-3 py-3 text-sm font-semibold text-white">Login</Link>}</div>}
  </header>
}

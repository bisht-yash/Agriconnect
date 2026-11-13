import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
export default function AppLayout(){return <div className="min-h-screen"><Navbar/><Outlet/><footer className="mt-20 border-t bg-white"><div className="mx-auto max-w-7xl px-6 py-8 text-sm text-slate-500">© {new Date().getFullYear()} AgriConnect · Smart Agriculture & Farmer Marketplace</div></footer></div>}

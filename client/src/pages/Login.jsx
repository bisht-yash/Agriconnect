import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login(){
 const {login}=useAuth(), nav=useNavigate(), location=useLocation(); const [form,setForm]=useState({email:'',password:''}); const [busy,setBusy]=useState(false);
 const submit=async(e)=>{e.preventDefault();setBusy(true);try{await login(form);toast.success('Welcome back!');nav(location.state?.from||'/dashboard',{replace:true})}catch(err){toast.error(err.response?.data?.message||'Login failed')}finally{setBusy(false)}};
 return <AuthShell title="Welcome back" subtitle="Sign in to continue to your AgriConnect dashboard."><form onSubmit={submit} className="space-y-5"><Field label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})} placeholder="you@example.com"/><Field label="Password" type="password" value={form.password} onChange={v=>setForm({...form,password:v})} placeholder="Minimum 8 characters"/><button disabled={busy} className="w-full rounded-xl bg-emerald-700 py-3 font-bold text-white disabled:opacity-60">{busy?'Signing in…':'Sign in'}</button><p className="text-center text-sm text-slate-500">New to AgriConnect? <Link className="font-bold text-emerald-700" to="/register">Create an account</Link></p></form></AuthShell>
}
export function AuthShell({title,subtitle,children}){return <main className="grid min-h-[calc(100vh-73px)] place-items-center bg-slate-50 px-4 py-12"><div className="w-full max-w-md rounded-3xl border bg-white p-7 shadow-sm sm:p-9"><div className="mb-8 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-700 text-white"><LogIn/></div><h1 className="mt-5 text-3xl font-black">{title}</h1><p className="mt-2 text-sm text-slate-500">{subtitle}</p></div>{children}</div></main>}
function Field({label,type='text',value,onChange,placeholder,required=true}){return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span><input required={required} type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"/></label>}
export { Field };

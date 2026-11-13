import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { AuthShell, Field } from './Login';

const initial={name:'',email:'',phone:'',password:'',role:'farmer',state:'',district:'',village:'',landSize:''};
export default function Register(){const [form,setForm]=useState(initial);const [busy,setBusy]=useState(false);const {register}=useAuth();const nav=useNavigate();const set=(k,v)=>setForm({...form,[k]:v});
 const submit = async (e) => {
  e.preventDefault();
  setBusy(true);

  try {
    await register({
      ...form,
      landSize: form.landSize === '' ? undefined : Number(form.landSize),
    });

    toast.success('Account created successfully');
    nav('/dashboard', { replace: true });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    console.log("RESPONSE:", err.response?.data);

    toast.error(
      err.response?.data?.message || 'Registration failed'
    );

  } finally {
    setBusy(false);
  }
};
 return <AuthShell title="Create your account" subtitle="Join farmers and buyers on AgriConnect."><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Field label="Full name" value={form.name} onChange={v=>set('name',v)} placeholder="Your name"/></div><Field label="Email" type="email" value={form.email} onChange={v=>set('email',v)} placeholder="you@example.com"/><Field label="Phone" value={form.phone} onChange={v=>set('phone',v)} placeholder="10–15 digits"/><Field label="Password" type="password" value={form.password} onChange={v=>set('password',v)} placeholder="Minimum 8 characters"/><label><span className="mb-2 block text-sm font-semibold text-slate-700">Role</span><select value={form.role} onChange={e=>set('role',e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3"><option value="farmer">Farmer</option><option value="buyer">Buyer</option></select></label><Field label="State" value={form.state} onChange={v=>set('state',v)} placeholder="Uttar Pradesh"/><Field label="District" value={form.district} onChange={v=>set('district',v)} placeholder="District"/><Field label="Village (optional)" required={false} value={form.village} onChange={v=>set('village',v)} placeholder="Village"/><Field label="Land size in acres (optional)" type="number" required={false} value={form.landSize} onChange={v=>set('landSize',v)} placeholder="0"/><button disabled={busy} className="sm:col-span-2 rounded-xl bg-emerald-700 py-3 font-bold text-white disabled:opacity-60">{busy?'Creating account…':'Create account'}</button><p className="sm:col-span-2 text-center text-sm text-slate-500">Already registered? <Link className="font-bold text-emerald-700" to="/login">Sign in</Link></p></form></AuthShell>}

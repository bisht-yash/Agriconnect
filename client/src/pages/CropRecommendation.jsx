import { useState } from 'react';
import { Sprout, Thermometer, Droplets, FlaskConical, CloudRain, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const initial = { nitrogen: 80, phosphorus: 40, potassium: 40, ph: 6.5, temperature: 25, humidity: 70, rainfall: 150, soilType: 'Loamy' };
const fields = [
  ['nitrogen','Nitrogen (N)','0–300'], ['phosphorus','Phosphorus (P)','0–300'], ['potassium','Potassium (K)','0–300'],
  ['ph','Soil pH','0–14'], ['temperature','Temperature (°C)','-20–70'], ['humidity','Humidity (%)','0–100'], ['rainfall','Rainfall (mm)','0–5000']
];

export default function CropRecommendation() {
  const [form, setForm] = useState(initial); const [loading, setLoading] = useState(false); const [result, setResult] = useState(null);
  const submit = async (e) => { e.preventDefault(); setLoading(true); setResult(null); try { const { data } = await api.post('/recommend-crop', form); setResult(data); toast.success('Recommendation generated'); } catch (e) { toast.error(e.response?.data?.message || 'ML service is not ready. Train the model first.'); } finally { setLoading(false); } };
  const reset = () => { setForm(initial); setResult(null); };
  return <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
    <div><div className="mb-2 flex items-center gap-2 text-emerald-700"><Sprout size={20}/><span className="font-semibold">SMART CROP INTELLIGENCE</span></div><h1 className="text-4xl font-bold tracking-tight text-slate-900">Find the right crop for your field</h1><p className="mt-2 max-w-2xl text-slate-600">Enter your soil and climate readings. AgriConnect sends them to a trained Random Forest model and returns the top recommendations.</p></div>
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 grid gap-4 sm:grid-cols-2">{fields.map(([key,label,range]) => <label key={key} className="block"><span className="text-sm font-medium text-slate-700">{label}</span><span className="mt-1 block text-xs text-slate-400">{range}</span><input required type="number" step="any" value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"/></label>)}</div>
        <label className="block"><span className="text-sm font-medium text-slate-700">Soil type</span><select value={form.soilType} onChange={e=>setForm({...form,soilType:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"><option>Loamy</option><option>Clay</option><option>Sandy</option><option>Silty</option><option>Black soil</option><option>Alluvial</option><option>Unknown</option></select></label>
        <div className="mt-6 flex gap-3"><button disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-60">{loading ? 'Analyzing…' : 'Recommend crops'}</button><button type="button" onClick={reset} className="rounded-xl border px-4" title="Reset"><RotateCcw size={18}/></button></div>
      </form>
      <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
        {!result ? <div className="flex h-full min-h-80 flex-col items-center justify-center text-center"><FlaskConical size={42} className="mb-4 text-emerald-400"/><h2 className="text-xl font-semibold">Your field report</h2><p className="mt-2 max-w-sm text-sm text-slate-400">Your result will appear here after the trained model processes your inputs.</p></div> : <div><p className="text-sm text-emerald-300">MODEL RECOMMENDATION</p><h2 className="mt-2 text-4xl font-bold capitalize">{result.recommendedCrop}</h2><div className="mt-5 rounded-2xl bg-white/10 p-4"><div className="flex justify-between text-sm"><span>Confidence</span><b>{Math.round(result.confidence*100)}%</b></div><div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-emerald-400" style={{width:`${result.confidence*100}%`}}/></div></div><h3 className="mt-6 font-semibold">Alternative crops</h3><div className="mt-3 space-y-2">{result.alternatives.map(x=><div key={x.crop} className="flex justify-between rounded-xl bg-white/10 px-4 py-3"><span className="capitalize">{x.crop}</span><span>{Math.round(x.probability*100)}%</span></div>)}</div><p className="mt-5 flex items-center gap-2 text-xs text-slate-400"><Thermometer size={14}/> Model: {result.model}</p></div>}
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-3"><Info icon={<Droplets/>} title="Soil + climate" text="Uses N, P, K, pH, temperature, humidity and rainfall."/><Info icon={<CloudRain/>} title="Top 3" text="Probability scores are returned from the trained classifier."/><Info icon={<FlaskConical/>} title="No fake result" text="If no model is trained, the API reports that instead of guessing."/></div>
  </div>
}
function Info({icon,title,text}){return <div className="rounded-2xl border bg-white p-5"><div className="mb-3 text-emerald-700">{icon}</div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-slate-500">{text}</p></div>}

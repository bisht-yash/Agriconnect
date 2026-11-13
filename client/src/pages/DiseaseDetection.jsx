import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Camera, CheckCircle2, ImagePlus, Leaf, ShieldCheck, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const MAX_SIZE = 5 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function DiseaseDetection() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [supported, setSupported] = useState([]);
  const [supportedLoading, setSupportedLoading] = useState(true);

  useEffect(() => {
    api.get('/detect-disease/supported')
      .then(({ data }) => setSupported(data.diseases || []))
      .catch(() => toast.error('Could not load supported disease information.'))
      .finally(() => setSupportedLoading(false));
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const grouped = useMemo(() => supported.reduce((acc, item) => {
    acc[item.cropName] = [...(acc[item.cropName] || []), item.name];
    return acc;
  }, {}), [supported]);

  const selectFile = (selected) => {
    if (!selected) return;
    if (!TYPES.includes(selected.type)) return toast.error('Use a JPEG, PNG or WebP image.');
    if (selected.size > MAX_SIZE) return toast.error('Image must be 5 MB or smaller.');
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected); setPreview(URL.createObjectURL(selected)); setResult(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Select a leaf image first.');
    setLoading(true); setResult(null);
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post('/detect-disease', form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 70000 });
      setResult(data); toast.success('Image analyzed successfully');
    } catch (e) {
      const message = e.response?.data?.message || e.response?.data?.detail || 'Disease detection service is not ready. Train the model first.';
      toast.error(message);
    } finally { setLoading(false); }
  };

  const clear = () => { if (preview) URL.revokeObjectURL(preview); setFile(null); setPreview(''); setResult(null); if (inputRef.current) inputRef.current.value = ''; };

  return <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
    <header>
      <div className="mb-2 flex items-center gap-2 text-emerald-700"><Leaf size={20}/><span className="font-semibold">AI CROP HEALTH</span></div>
      <h1 className="text-4xl font-black tracking-tight text-slate-900">Detect supported crop diseases</h1>
      <p className="mt-3 max-w-3xl text-slate-600">Upload a clear leaf image. AgriConnect sends it to a MobileNetV3 transfer-learning model and returns the most likely supported class with confidence and basic management guidance.</p>
    </header>

    <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div onClick={() => inputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); selectFile(e.dataTransfer.files?.[0]); }} className="cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-emerald-500 hover:bg-emerald-50/30">
          <input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e => selectFile(e.target.files?.[0])}/>
          {preview ? <div className="relative"><img src={preview} alt="Selected crop leaf" className="mx-auto max-h-[430px] rounded-2xl object-contain"/><button type="button" onClick={e => { e.stopPropagation(); clear(); }} className="absolute right-2 top-2 rounded-full bg-white p-2 shadow" aria-label="Remove image"><X size={18}/></button></div> : <div className="flex min-h-72 flex-col items-center justify-center text-center"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><ImagePlus size={30}/></div><h2 className="mt-5 text-xl font-bold">Drop a leaf image here</h2><p className="mt-2 text-sm text-slate-500">or click to browse · JPEG, PNG or WebP · max 5 MB</p><span className="mt-5 inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-semibold"><Upload size={16}/> Choose image</span></div>}
        </div>
        <div className="mt-5 flex gap-3"><button disabled={!file || loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Camera size={18}/>{loading ? 'Analyzing image…' : 'Analyze disease'}</button><button type="button" onClick={clear} className="rounded-xl border px-5 py-3 font-semibold">Clear</button></div>
      </form>

      <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
        {!result ? <div className="flex min-h-[480px] flex-col items-center justify-center text-center"><ShieldCheck size={44} className="text-emerald-400"/><h2 className="mt-5 text-2xl font-bold">AI health report</h2><p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">Your classification, confidence and available guidance will appear here after analysis.</p><div className="mt-6 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-xs text-slate-300"><AlertTriangle size={15}/> Classification aid, not a definitive diagnosis.</div></div> : <Result result={result}/>} 
      </section>
    </div>

    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold">Supported crops & classes</h2><p className="mt-1 text-sm text-slate-500">Only classes represented by the trained dataset are supported.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{supported.length} classes</span></div>
      {supportedLoading ? <div className="mt-6 h-20 animate-pulse rounded-2xl bg-slate-100"/> : <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(grouped).map(([crop, diseases]) => <div key={crop} className="rounded-2xl border p-4"><h3 className="font-bold">{crop}</h3><ul className="mt-2 space-y-1 text-sm text-slate-600">{diseases.map(d => <li key={d}>• {d}</li>)}</ul></div>)}</div>}
    </section>
  </main>;
}

function Result({ result }) {
  const confidence = Math.round((result.confidence || 0) * 100);
  return <div><p className="text-sm font-semibold text-emerald-300">MODEL CLASSIFICATION</p><div className="mt-5 flex items-start justify-between gap-4"><div><h2 className="text-3xl font-black capitalize">{result.disease}</h2><p className="mt-1 text-slate-400">Crop: <span className="capitalize text-slate-200">{result.crop}</span></p></div><div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/15 text-lg font-bold text-emerald-300">{confidence}%</div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400" style={{width:`${Math.min(confidence,100)}%`}}/></div>
  {result.guidance ? <div className="mt-7 space-y-5">{[['Symptoms', result.guidance.symptoms], ['Prevention', result.guidance.prevention], ['Management', result.guidance.management]].map(([title, items]) => <div key={title}><h3 className="font-semibold">{title}</h3><ul className="mt-2 space-y-2 text-sm leading-6 text-slate-300">{items.map(x => <li key={x} className="flex gap-2"><CheckCircle2 className="mt-1 shrink-0 text-emerald-400" size={15}/>{x}</li>)}</ul></div>)}</div> : <p className="mt-6 text-sm text-slate-400">No structured guidance record is available for this model class yet.</p>}
  <div className="mt-7 rounded-2xl bg-amber-400/10 p-4 text-xs leading-5 text-amber-100"><AlertTriangle className="mr-2 inline" size={14}/>{result.advisoryNotice}</div><p className="mt-4 text-xs text-slate-500">Model: {result.model}</p></div>;
}

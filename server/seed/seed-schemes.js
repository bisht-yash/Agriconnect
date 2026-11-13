import 'dotenv/config'; import mongoose from 'mongoose'; import GovernmentScheme from '../models/GovernmentScheme.js'; import schemes from './schemes.js';
await mongoose.connect(process.env.MONGO_URI||'mongodb://127.0.0.1:27017/agriconnect');
for(const s of schemes) await GovernmentScheme.findOneAndUpdate({name:s.name},s,{upsert:true,new:true,setDefaultsOnInsert:true});
console.log(`Seeded ${schemes.length} verified-source scheme records.`); await mongoose.disconnect();

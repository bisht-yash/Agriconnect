import 'dotenv/config';
import mongoose from 'mongoose';
import Disease from '../models/Disease.js';
import { diseaseSeed } from './diseases.js';

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agriconnect';
await mongoose.connect(uri);
await Disease.deleteMany({});
await Disease.insertMany(diseaseSeed.map(item => ({ ...item, supported: true })));
console.log(`Seeded ${diseaseSeed.length} disease records.`);
await mongoose.disconnect();

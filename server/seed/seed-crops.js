import 'dotenv/config';
import mongoose from 'mongoose';
import Crop from '../models/Crop.js';
import { crops } from './crops.js';
const uri=process.env.MONGO_URI||'mongodb://127.0.0.1:27017/agriconnect';
await mongoose.connect(uri); await Crop.deleteMany({}); await Crop.insertMany(crops); console.log(`Seeded ${crops.length} crops`); await mongoose.disconnect();

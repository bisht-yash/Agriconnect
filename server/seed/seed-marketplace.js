import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ProductListing from '../models/ProductListing.js';

const demoUsers=[
 {name:'Ramesh Farmer',email:'farmer.demo@agriconnect.local',phone:'9000000001',password:'Farmer@123',role:'farmer',state:'Uttar Pradesh',district:'Ghaziabad'},
 {name:'Anita Buyer',email:'buyer.demo@agriconnect.local',phone:'9000000002',password:'Buyer@123',role:'buyer',state:'Delhi',district:'New Delhi'}
];
const listings=[
 {cropName:'Wheat',quantity:500,unit:'kg',expectedPrice:28,state:'Uttar Pradesh',district:'Ghaziabad',qualityGrade:'Grade A',description:'Freshly harvested wheat, cleaned and ready for collection.'},
 {cropName:'Mustard',quantity:300,unit:'kg',expectedPrice:62,state:'Uttar Pradesh',district:'Meerut',qualityGrade:'Grade A',description:'Clean mustard seed from the current harvest.'},
 {cropName:'Potato',quantity:800,unit:'kg',expectedPrice:20,state:'Uttar Pradesh',district:'Agra',qualityGrade:'Premium',description:'Fresh table potatoes, sorted by size.'}
];
await mongoose.connect(process.env.MONGO_URI||'mongodb://127.0.0.1:27017/agriconnect');
const users={}; for(const u of demoUsers){const hash=await bcrypt.hash(u.password,12);users[u.role]=await User.findOneAndUpdate({email:u.email},{...u,password:hash},{upsert:true,new:true,setDefaultsOnInsert:true});}
for(const l of listings){await ProductListing.findOneAndUpdate({farmer:users.farmer._id,cropName:l.cropName,description:l.description},{...l,farmer:users.farmer._id,status:'active'},{upsert:true,new:true,setDefaultsOnInsert:true});}
console.log('Seeded marketplace demo data.'); await mongoose.disconnect();

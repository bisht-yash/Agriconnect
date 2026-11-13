import mongoose from 'mongoose';
const schema=new mongoose.Schema({farmer:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},crop:{type:mongoose.Schema.Types.ObjectId,ref:'Crop'},cropName:{type:String,required:true,index:true},imageUrl:String,quantity:{type:Number,required:true,min:0},unit:{type:String,required:true},expectedPrice:{type:Number,required:true,min:0},location:{state:String,district:String},harvestDate:Date,description:String,qualityGrade:String,contactPhone:String,status:{type:String,enum:['active','reserved','sold','closed'],default:'active',index:true}},{timestamps:true});
schema.index({cropName:'text',description:'text'});
export default mongoose.model('ProductListing',schema);

import mongoose from 'mongoose';
const schema=new mongoose.Schema({listing:{type:mongoose.Schema.Types.ObjectId,ref:'ProductListing',required:true,index:true},buyer:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},farmer:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},offeredPrice:{type:Number,required:true,min:0},quantity:{type:Number,required:true,min:0},message:String,status:{type:String,enum:['pending','accepted','rejected','withdrawn'],default:'pending',index:true}},{timestamps:true});
export default mongoose.model('Offer',schema);

import mongoose from 'mongoose';
const schema=new mongoose.Schema({crop:{type:mongoose.Schema.Types.ObjectId,ref:'Crop'},cropName:{type:String,required:true},name:{type:String,required:true},symptoms:[String],prevention:[String],management:[String],supported:{type:Boolean,default:true}},{timestamps:true});
export default mongoose.model('Disease',schema);

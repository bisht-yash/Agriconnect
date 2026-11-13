import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true},email:{type:String,required:true,unique:true,lowercase:true,index:true},phone:{type:String,required:true},password:{type:String,required:true,select:false},role:{type:String,enum:['farmer','buyer','admin'],default:'farmer',index:true},state:{type:String,required:true},district:{type:String,required:true},village:String,landSize:{type:Number,min:0}},{timestamps:true});
export default mongoose.model('User',schema);

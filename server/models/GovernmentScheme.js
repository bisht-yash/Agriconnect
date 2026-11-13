import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,required:true,index:true},description:{type:String,required:true},department:String,state:{type:String,index:true},eligibility:String,farmerCategory:[String],cropCategory:[String],benefits:String,requiredDocuments:[String],applicationProcess:[String],officialApplicationUrl:{type:String,required:true},sourceUrl:{type:String,required:true},lastVerifiedDate:{type:Date,required:true},schemeType:{type:String,index:true}},{timestamps:true});
schema.index({name:'text',description:'text'});
export default mongoose.model('GovernmentScheme',schema);

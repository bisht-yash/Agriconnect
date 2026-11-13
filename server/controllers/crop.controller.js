import Crop from '../models/Crop.js';

export async function listCrops(req,res,next){try{const q=String(req.query.q||'').trim();const filter=q?{name:{$regex:q,$options:'i'}}:{};const crops=await Crop.find(filter).sort({name:1}).lean();res.json(crops)}catch(e){next(e)}}
export async function getCrop(req,res,next){try{const crop=await Crop.findById(req.params.id).lean();if(!crop)return res.status(404).json({message:'Crop not found'});res.json(crop)}catch(e){next(e)}}
export async function createCrop(req,res,next){try{const crop=await Crop.create(req.body);res.status(201).json(crop)}catch(e){next(e)}}
export async function updateCrop(req,res,next){try{const crop=await Crop.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}).lean();if(!crop)return res.status(404).json({message:'Crop not found'});res.json(crop)}catch(e){next(e)}}
export async function deleteCrop(req,res,next){try{const crop=await Crop.findByIdAndDelete(req.params.id);if(!crop)return res.status(404).json({message:'Crop not found'});res.json({message:'Crop deleted'})}catch(e){next(e)}}

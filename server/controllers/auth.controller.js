import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
const schema=z.object({name:z.string().min(2),email:z.string().email(),phone:z.string().min(10).max(15),password:z.string().min(8),role:z.enum(['farmer','buyer']).default('farmer'),state:z.string().min(2),district:z.string().min(2),village:z.string().optional(),landSize:z.number().min(0).optional()});
const token=id=>jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'7d'});
export async function register(req,res,next){try{const data=schema.parse(req.body);if(await User.exists({email:data.email}))return res.status(409).json({success:false,message:'Email already registered'});data.password=await bcrypt.hash(data.password,12);const user=await User.create(data);res.status(201).json({success:true,token:token(user.id),user:{id:user.id,name:user.name,email:user.email,role:user.role,state:user.state,district:user.district}});}catch(e){next(e)}}
export async function login(req,res,next){try{const {email,password}=req.body;const user=await User.findOne({email}).select('+password');if(!user||!(await bcrypt.compare(password,user.password)))return res.status(401).json({success:false,message:'Invalid email or password'});res.json({success:true,token:token(user.id),user:{id:user.id,name:user.name,email:user.email,role:user.role,state:user.state,district:user.district}});}catch(e){next(e)}}
export async function me(req,res){res.json({success:true,user:req.user});}

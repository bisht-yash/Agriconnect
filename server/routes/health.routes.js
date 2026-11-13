import { Router } from 'express';
const r=Router(); r.get('/',(_,res)=>res.json({success:true,status:'ok',service:'agriconnect-api'})); export default r;

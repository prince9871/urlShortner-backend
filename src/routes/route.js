const express=require('express')
const router=express.Router()

router.get('/test',function(req,res){
    return res.send('this api working')
})


module.exports=router
const express=require('express')
const mongoose=require('mongoose')
const route=require('./routes/route')

const app=express()

app.use(express.json())

mongoose.connect('mongodb+srv://prince9871:BZjeaWxY1uTLCefz@cluster0.pelsn1m.mongodb.net/group63Database',{
    useNewUrlParser:true
})
    .then(()=>{console.log('mongoDb is connected')})
    .catch((err)=>{console.log(err)})

app.use('/',route)

app.use(function(req,res){
    return res.status(400).send({status:false,msg:'Invalid Url'})
})
const prt=3000
app.listen(prt,function(){
    console.log('Express app is connected '+prt)
})
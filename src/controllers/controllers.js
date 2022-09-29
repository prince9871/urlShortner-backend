const shortId = require("shortid");
const urlModel = require("../models/urlModel");
const validUrl = require("valid-url");
const { isValidString } = require("../validations/validations");

async function url(req, res) {
  try {
    const data = req.body;

    if(Object.keys(data).length===0){
        return res
        .status(400)
        .send({ status: false, message: "required data" });
    }

    if(!isValidString(data.longUrl)){
        return res
        .status(400)
        .send({ status: false, message: "longUrl must be in string format" });
    }

    if (!validUrl.isUri(data.longUrl)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid longUrl" });
    }

    const urlDocument = await urlModel.findOne(data);
    if (urlDocument) {
      return res.status(200).send({ status: true, data: urlDocument });
    }

    data.urlCode = shortId.generate(data.longUrl);
    data.shortUrl = `http://localhost:3000/${data.urlCode}`;

    const urlDoc = await urlModel.create(data);

    return res.status(201).send({ status: true, data: urlDoc });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
}


const getUrl = async function(req, res){
  try {
    let code = req.params
    if(code.urlCode===":urlCode"){
      return res.status(400).send({status: false, msg: "require urlCode"})
    }
    const checkUrl = await urlModel.findOne({urlCode: code.urlCode})
    if(!checkUrl){
      return res.status(404).send({status: false, msg: "urlCode not found"})
    }
    let longCode = checkUrl.longUrl
    return res.status(302).send(`Found. Redirecting to: ${longCode}`)
  } catch (error) {
    return res.status(500).send({status: false, msg: error.message})
  }
}
module.exports = { url, getUrl };

const shortId = require("shortid");
const urlModel = require("../models/urlModel");
// const validUrl = require("valid-url");
const { isValidString, isValidUrl } = require("../validations/validations");

const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
  13489,
  "redis-13489.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("53kQRUXp3EYwFNgxmttXuVawmIr2ifmx", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

async function url(req, res) {
  try {
    const data = req.body;

    if (Object.keys(data).length === 0) {
      return res.status(400).send({ status: false, message: "required data" });
    }

    if (!Object.keys(data).includes("longUrl")) {
      return res.status(400).send({
        status: false,
        message: "required longUrl key in request body",
      });
    }

    if (!isValidString(data.longUrl)) {
      return res
        .status(400)
        .send({ status: false, message: "longUrl must be in string format" });
    }

    if (!isValidUrl(data.longUrl)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid longUrl" });
    }

    // const urlDocument = await urlModel
    //   .findOne({ longUrl: data.longUrl })
    //   .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    // if (urlDocument) {
    //   return res.status(200).send({ status: true, data: urlDocument });
    // }

    let urlDocument = await GET_ASYNC(`${req.body.longUrl}`);
    if (urlDocument) {
      return res.status(200).send({ status: true, data: urlDocument });
    }
    // else {
    //   let urlD = await urlModel
    //     .findOne({ longUrl: data.longUrl })
    //     .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    //   if (urlD) {
    //     await SET_ASYNC(`${req.body.longUrl}`, JSON.stringify(urlD));
    //     return res.status(700).send({ data: urlD });
    //   }
    // }

    data.urlCode = shortId.generate(data.longUrl);
    data.shortUrl = `http://localhost:3000/${data.urlCode}`;

    const urlDoc = await urlModel.create(data);
    const doc = urlDoc.toObject();
    delete doc["_id"];
    delete doc["createdAt"];
    delete doc["updatedAt"];
    delete doc["__v"];
    await SET_ASYNC(`${req.body.longUrl}`, JSON.stringify(doc));
    return res.status(201).send({ status: true, data: doc });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
}

const getUrl = async function (req, res) {
  try {
    let code = req.params;
    if (code.urlCode === ":urlCode") {
      return res.status(400).send({ status: false, msg: "required urlCode" });
    }
    if (!shortId.isValid(code.urlCode)) {
      return res.status(400).send({ status: false, msg: "invalid urlCode" });
    }

    let ckUrl = await GET_ASYNC(`${req.params.urlCode}`);
    if (ckUrl) {
      return res.status(302).redirect(ckUrl);
    }

    const checkUrl = await urlModel.findOne({ urlCode: code.urlCode });
    if (!checkUrl) {
      return res
        .status(404)
        .send({ status: false, msg: "urlCode not founded" });
    }

    let longCode = checkUrl.longUrl;

    await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(longCode));

    return res.status(302).redirect(longCode);
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};
module.exports = { url, getUrl };

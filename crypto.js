import crypto from "crypto";

const accessTokenSecret = crypto.randomBytes(32).toString("hex");

console.log(accessTokenSecret);
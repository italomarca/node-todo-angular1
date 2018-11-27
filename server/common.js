const fs = require('fs');
const axios = require('axios');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const path = require('path');

const RSA_PRIVATE_KEY = fs.readFileSync(path.resolve(__dirname, '../demos/private.key'));

const validateReq = async function (req, key = RSA_PRIVATE_KEY) {
  try {
    const token = req.headers['x-access-token'];

    if (!token) {
      return {
        err: { status: 400, auth: false, message: 'No token provided.' },
        decoded: null
      };
    };

    const decoded = await jwt.verify(token, key);

    return decoded;
  } catch (error) {
    return error;
  };
};

const callApi = async function (req, key = RSA_PRIVATE_KEY) {
  try {
    const token = jwt.sign({ id: req.data.userId }, key, {
      expiresIn: 100
    });

    req.headers['x-access-token'] = token;

    const decodedKey = await validateReq(req, key);

    if (!decodedKey.id) {
      throw new Error('401');
    };

    const result = await axios.request(req);
    result.catch(() => {});

    return result;
  } catch (error) {
    // console.log('Erro callApi:', error);
    throw new Error('500');
  };
};

module.exports = {
  RSA_PRIVATE_KEY: RSA_PRIVATE_KEY,
  validateReq: validateReq,
  callApi: callApi
};

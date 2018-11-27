/* eslint-disable no-undef */

// const assert = require('assert');
const { callApi, RSA_PRIVATE_KEY } = require('../server/common');

describe('Server', () => {
  it('#Private key loaded', (done) => {
    if (!RSA_PRIVATE_KEY) {
      done(new Error('Failed to load private key'));
      return;
    }
    done();
  });

  describe('#Endpoints ok', () => {
    it('Should return response "200 OK"', (done) => {
      const req = {
        method: 'post',
        url: 'localhost/api/todos',
        data: {
          userId: '5bf7f3890e93c80008fb7d31'
        },
        headers: []
      };

      callApi(req, RSA_PRIVATE_KEY)
        .then((result) => {
          // console.log(result);
          done();
        })
        .catch((error) => {
          done(new Error(error));
        });
    });
  });
});

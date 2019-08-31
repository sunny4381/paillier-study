const queryString = require('query-string');
const bigInt = require('big-integer');
const paillier = require('paillier-js');
const QRCode = require('qrcode');

// window.bigInt = bigInt;
// window.paillier = paillier;

const params = queryString.parse(location.search);
if (!params.n || !params.g) {
  const {publicKey, privateKey} = paillier.generateRandomKeys(2048);
  params.n = publicKey.n.toString();
  params.g = publicKey.g.toString();

  window.location.href = "/?" + queryString.stringify(params);
}

const n = bigInt(params.n);
const g = bigInt(params.g);
const publicKey = new paillier.PublicKey(n, g);

window.bigInt = bigInt;
window.paillier = paillier;
window.key = publicKey;

function messageToValue(message) {
  var value = null;
  if (message === "c0") {
    value = bigInt(0);
  } else if (message === "c1") {
    value = bigInt(1);
  } else if (message === "c2") {
    value = bigInt(4);
  } else if (message === "c3") {
    value = bigInt(16);
  }
  return value;
}

function encryptMessage(key, message) {
  const value = messageToValue(message);
  // console.log({ message: message, value: value });
  if (! value) {
    return null;
  }

  return key.encrypt(value);
}

window.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll("[name='vote']").forEach(function(el) {
    el.addEventListener("click", function() {
      const c = encryptMessage(publicKey, this.value);
      if (! c) {
        return;
      }

      console.log(c.toString());
      const canvas = document.getElementById('ballot-canvas')
      QRCode.toCanvas(canvas, c.toString(), function (error) {
        if (error) console.error(error)
        console.log('success!');
      });

      $("#ballot").modal();
    });
  });
});

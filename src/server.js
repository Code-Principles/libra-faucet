
const { exec } = require('child_process');
const child = exec('target/debug/client --host ac.testnet.libra.org --port 8000 -s ./scripts/cli/trusted_peers.config.toml', { cwd: '/Users/ollie/libra/repo/libra' });
var express = require("express");
var cors = require('cors');

var app = express();
app.use(cors())

var operationStack = [];

const operations = { BALANCE: 'balance', MINT: 'mint' };
const requestMap = new Map();
const TIME_LIMIT = 1000 * 60 * 60 * 24;

child.stdout.setEncoding('utf8');

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
  init();
});

app.get("/balance", (req, res, next) => { //example call http://localhost:3000/balance?address=ce019b16673ac265b3e0c13690bdd415cd3f22268457b171a52b9a5ee62e7db2
  const { address } = req.query;
  console.log("/balance");
  if (address && address.length === 64) { //example address ce019b16673ac265b3e0c13690bdd415cd3f22268457b171a52b9a5ee62e7db2
    operator(operations.BALANCE, { address }, (balance) => {
      res.json(balance);
    })
  } else {
    res.json({ errorCode: 1 });
  }
});

app.get("/mint", (req, res, next) => { //example call http://localhost:3000/mint?address=ce019b16673ac265b3e0c13690bdd415cd3f22268457b171a52b9a5ee62e7db2&amount=1
  const { address, amount } = req.query;
  console.log("/mint");
  console.log({ address, amount })
  let data = requestMap.get(address);
  let amountParsed = parseInt(amount, 10);
  if (!data || Date.now() > data.timestamp + TIME_LIMIT) {
    data = { total: 0 }
  }
  console.log(Date.now() + TIME_LIMIT)
  console.log(data)
  let newMintTotal = data.total + amountParsed;
  console.log('total after mint:' + newMintTotal);
  if(newMintTotal > 10 && data.total<10){
    newMintTotal = 10;
  }
  if (address &&
    address.length === 64 &&
    Number.isInteger(amountParsed) &&
    newMintTotal <= 10) {
    operator(operations.MINT, { address, amount }, (status) => {
      if (!status.errorCode) {
        requestMap.set(address, { total: newMintTotal, timestamp: Date.now() });
      }
      res.json(status);
    })
  } else if (newMintTotal > 10) {
    res.json({ errorCode: 1 });
  } else {
    res.json({ errorCode: 2 });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
  init();
});

operator = (operation, data, cb) => {
  switch (operation) {
    case operations.BALANCE:
      operationStack.push(cb)
      child.stdin.write(`query balance ${data.address}\n`);
      break;
    case operations.MINT:
      console.log(cb)
      console.log(data)
      console.log(`account mintb ${data.address} ${data.amount}\n`)
      operationStack.push(cb)
      child.stdin.write(`account mintb ${data.address} ${data.amount}\n`);
      break;
  }
}

async function init() {
  setTimeout(() => {
    console.log("loaded")
    child.stdout.on('data', (chunk) => {
      console.log("chunk:" + chunk)
      console.log("======")
      if (!isNullOrWhitespace(chunk)) {
        let frame = operationStack.pop();
        try {
          let obj = JSON.parse(chunk);
          console.log(obj);
          frame(obj);
        } catch (ex) {
          console.log(ex);
          frame({ errorCode: 3 });
        }

      }

    });
    operationStack = [];
  }, 10000)
}

function isNullOrWhitespace(input) {

  if (typeof input === 'undefined' || input == null) return true;

  return input.replace(/\s/g, '').length < 1;
}
const BN = require('bn.js')
let VM = require('ethereumjs-vm').default
let Account = require('ethereumjs-account').default
let utils = require('ethereumjs-util')
let Transaction = require('ethereumjs-tx').Transaction

const vm = new VM()

const keyPair  = require('./key-pair')
const privateKey = utils.toBuffer(keyPair.secretKey)
const publicKeyBuf = utils.toBuffer(keyPair.publicKey)

const address = utils.pubToAddress(publicKeyBuf, true)

console.log('--------------------')
console.log('Sender address: ', utils.bufferToHex(address))

const account = new Account({
  balance: 100e18,
})

vm.stateManager.putAccount(address, account, async function() {
  const tx1 = require('./raw-tx')
  const tx2 = require('./raw-tx2')

  await runTx(vm, tx1, privateKey)
  await runTx(vm, tx2, privateKey)
  
})

async function runTx(vm, rawTx, pk) {
  const tx = new Transaction(rawTx)
  tx.sign(pk)

  console.log('tx: ', tx)

  console.log('------ running tx -------')
  const results = await vm.runTx({
    tx: tx,
  })

  const createdAddress = results.createdAddress

  if (createdAddress) {
    console.log('address created: ' + createdAddress.toString('hex'))
    return createdAddress
  }
  
  console.log('---')
}

vm.on('step', function(data) {
  console.log(`Opcode: ${data.opcode.name}\tStack: ${data.stack}`)
})


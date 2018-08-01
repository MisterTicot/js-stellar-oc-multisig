if (typeof document === 'undefined' && typeof StellarSdk === 'undefined') {
  /// Node
  global.StellarSdk = require('stellar-sdk')
}

const multisig = require('../src')
multisig.network = 'test'
multisig.server = 'https://horizon-testnet.stellar.org'

/// Please don't mess with those accounts ^^^(*.*)^^^.
const account1 = StellarSdk.Keypair.fromSecret('SDTSZAHJXKHE5PR6WAPAZ7BH3GMOYYDTQ5Z2RJHGWSYCOM45FWFKTJSU')
const account2 = StellarSdk.Keypair.fromSecret('SB7XOHXPZ6MM4MMORBAO2HEODX3QC6FF6CID4RIUF25GRZNDWLJROK2A')
const transaction1 = new StellarSdk.Transaction('AAAAAMg77z7lw5ND+swacBhjC6uGw0qVYfBJ3WwG88aivwJkAAAAZACciIb/////AAAAAAAAAAAAAAABAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==')
const transaction1_signed = new StellarSdk.Transaction('AAAAAMg77z7lw5ND+swacBhjC6uGw0qVYfBJ3WwG88aivwJkAAAAZACciIb/////AAAAAAAAAAAAAAABAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqK/AmQAAABAW2CFIqrm01y0ILx7o2efJaHxQlkzXTdA5I/uBSpryzGq0m6zJvLIq7AP4tdUSe1PrV+YcbT56KFEnYtGnGoRBCI3ON8AAABAOxSM2T6pHZyQHI+IQcXqLGjURX9xkcuFYWm5BiTeew4QvZ2yHivXuAqDaEUyKLlTpeDY34zkAaUsuWBxlJ3wAw==')
const transaction2 = new StellarSdk.Transaction('AAAAAMg77z7lw5ND+swacBhjC6uGw0qVYfBJ3WwG88aivwJkAAABLACciIcAAAAFAAAAAAAAAAAAAAADAAAAAAAAAAoAAAAIbWlncmF0ZWQAAAABAAAABHRydWUAAAABAAAAAOUXePrDPMF7LvqdF6bynRgWT2T7M+8ItWsoCiym8bTnAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAADWFueXdhbGxldC5vcmcAAAAAAAAAAAAAAQAAAADIO+8+5cOTQ/rMGnAYYwurhsNKlWHwSd1sBvPGor8CZAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==')
const transaction2_signed = new StellarSdk.Transaction('AAAAAMg77z7lw5ND+swacBhjC6uGw0qVYfBJ3WwG88aivwJkAAABLACciIcAAAAFAAAAAAAAAAAAAAADAAAAAAAAAAoAAAAIbWlncmF0ZWQAAAABAAAABHRydWUAAAABAAAAAOUXePrDPMF7LvqdF6bynRgWT2T7M+8ItWsoCiym8bTnAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAADWFueXdhbGxldC5vcmcAAAAAAAAAAAAAAQAAAADIO+8+5cOTQ/rMGnAYYwurhsNKlWHwSd1sBvPGor8CZAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiI3ON8AAABANl57OfeUcF9WIyqBQAGdDjF5Jj+qlnRvDqOIeZPDQXrm8rDyBKJWnH9LZYmr7zDP3Atdo7eCr/LWL3N04Y6eBKK/AmQAAABArvzmhWe5Y924Dfyb4BpfZw4CTUKukilDdX43QOFenq/CU/zMQV7sIuanUQNi7vFMRSkQNZ4r/+mNeW6e6rr6BA==')

async function test () {
  await report('multisig.enable(account1)')
  await report('multisig.enable(account2)')
  await report('multisig.isEnabled(account1)')
  await report('multisig.isEnabled(account2)')
  await report('multisig.config(account1)')
  await report('multisig.config(account2)')
  await report('multisig.pullSignatures(transaction1)')
  await report('multisig.pullSignatures(transaction2)')
  await report('multisig.pushSignatures(transaction1_signed)')
  await report('multisig.pushSignatures(transaction2_signed)')
  await report('multisig.disable(account1.publicKey())')
  await report('multisig.disable(account2)')
}
test()

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
async function report (command) {
  console.log(command)
  console.log('==============================')
  const promise = eval(command)
  await promise.then(console.log).catch(console.error)
  console.log('')
}


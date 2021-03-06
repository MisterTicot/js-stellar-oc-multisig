"use_strict"
const shareSignatures = exports

const Buffer = require("@cosmic-plus/base/es5/buffer")
const StellarSdk = require("@cosmic-plus/base/es5/stellar-sdk")

const messenger = require("./messenger")
const resolve = require("./resolve")

/**
 * Returns a sharing transaction that will push any new signature from
 * `transaction`. The sharing transactions should be signed by `accountId` and
 * sent to `conf.multisig.network`.
 */
shareSignatures.makePushTx = async function (conf, transaction, senderId) {
  const signatures = transaction.signatures.map(entry => entry.signature())
  if (!transaction.signatures.length) return null

  /// Push only signatures that have not been uploaded yet.
  const txHash = transaction.hash()
  const signers = await resolve.txSignersList(conf, transaction)
  const alreadyOnchain = await getSignatures(conf, txHash, signers)
  const newSignatures = onlyInFirstArray(signatures, alreadyOnchain)
  if (!newSignatures.length) return null

  /// Make the transaction that puts signatures on-chain.
  const sender = await resolve.account(conf.multisig, senderId)
  const destination = conf.multisig.id
  const object = new StellarSdk.Memo("return", txHash)
  const message = Buffer.concat(signatures)
  return messenger.encode(conf.multisig, sender, destination, object, message)
}

function onlyInFirstArray (array1, array2) {
  return array1.filter(x => !array2.find(y => x.toString() === y.toString()))
}

/**
 * Pull signatures for `transaction` published on `conf.multisig.network`.
 */
shareSignatures.pull = async function (conf, transaction) {
  const txHash = transaction.hash()
  const signers = await resolve.txSignersList(conf, transaction)
  const signatures = await getSignatures(conf, txHash, signers)
  return mergeSignatures(transaction, signatures, txHash, signers)
}

/**
 * Returns an array of the signatures shared on-chain for `txHash`.
 */
async function getSignatures (conf, txHash, signers) {
  const txHash64 = txHash.toString("base64")

  if (await resolve.accountIsEmpty(conf.multisig, conf.multisig.id)) {
    return []
  }

  /// Get transactions that embed shared signatures for transaction.
  const records = await messenger.listRaw(conf.multisig, conf.multisig.id, {
    filter: tx => tx.memo_type === "return" && tx.memo === txHash64
  })

  const signatures = []
  for (let index in records) {
    const txRecord = records[index]
    const transaction = new StellarSdk.Transaction(txRecord.envelope_xdr)
    if (!isTxSourceLegit(transaction, signers)) continue
    transaction.operations.forEach(operation => {
      if (containsSignature(operation)) signatures.push(operation.value)
    })
  }

  return signatures
}

function isTxSourceLegit (transaction, signers) {
  return signers.find(signer => signer === transaction.source)
}

function containsSignature (operation) {
  return operation.type === "manageData" && operation.name === "Send"
}

/**
 * Test `signatures` against `signers` and add new legit ones to `transaction`.
 */
function mergeSignatures (transaction, signatures, txHash, signers) {
  let newSignatures = false
  const txSigs = transaction.signatures.map(x => x.signature().toString())
  const keys = signers.map(x => StellarSdk.Keypair.fromPublicKey(x))

  for (let index in signatures) {
    const signature = signatures[index]
    if (txSigs.find(x => x === signature.toString())) continue
    const signer = keys.find(x => x.verify(txHash, signature))
    if (!signer) continue
    const decoratedSignature = makeDecorated(signer, signature)
    transaction.signatures.push(decoratedSignature)
    txSigs.push(signature.toString())
    newSignatures = true
  }

  return newSignatures
}

function makeDecorated (signer, signature) {
  const Constructor = StellarSdk.xdr.DecoratedSignature
  return new Constructor({ hint: signer.signatureHint(), signature: signature })
}

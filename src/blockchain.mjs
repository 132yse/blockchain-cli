import crypto from 'crypto'

const INIT_BLOCK = {
  index: 0,
  prevHash: '0',
  data: 'hello clicli!',
  timestamp: 1550988664781,
  nonce: 73479,
  hash: '0000cf4a6139c07ef04792b79ad48142e957198e20a4d03d1008cf35f77e7b7c'
}

export default class Blockchain {
  constructor() {
    this.blockchain = [INIT_BLOCK]
    this.data = []
    this.difficulty = 4
  }

  mine(address) {
    this.transfer('clicli', address, 100)
    const newBlock = this.generateNewBlock()
    if (this.isValidBlock(newBlock) && this.isValidChain(this.blockchain)) {
      this.blockchain.push(newBlock)
      this.data = []
      return newBlock
    } else {
      console.log('区块链校验失败', newBlock)
    }
  }

  getLastBlock() {
    return this.blockchain[this.blockchain.length - 1]
  }

  transfer(from, to, amount) {
    if (from !== 'clicli') {
      const blance = this.blance(from)
      if (blance < amount) {
        console.log('余额不够', from, to, amount)
        return
      }
    }
    const data = { from, to, amount }
    this.data.push(data)
    return data
  }

  blance(address) {
    let blance = 0
    this.blockchain.forEach(block => {
      if (!Array.isArray(block.data)) return
      block.data.forEach(trans => {
        if (address === trans.from) blance -= trans.amount
        if (address === trans.to) blance += trans.amount
      })
    })
    return blance
  }

  generateNewBlock() {
    let
      index = this.blockchain.length,
      prevHash = this.getLastBlock().hash,
      data = this.data,
      timestamp = new Date().getTime(),
      nonce = 0

    let hash = this.computeHash({ index, prevHash, timestamp, data, nonce })
    while (hash.slice(0, this.difficulty) !== '0'.repeat(this.difficulty)) {
      nonce++
      hash = this.computeHash({ index, prevHash, timestamp, data, nonce })
    }

    return { index, prevHash, timestamp, data, nonce, hash }
  }

  computeHash({ index, prevHash, timestamp, data, nonce }) {
    return crypto
      .createHash('sha256')
      .update(index + prevHash + timestamp + data + nonce)
      .digest('hex')
  }

  isValidBlock(newBlock, lastBlock = this.getLastBlock()) {
    if (newBlock.index !== lastBlock.index + 1) return false
    if (newBlock.timestamp <= lastBlock.timestamp) return false
    if (newBlock.prevHash !== lastBlock.hash) return false
    if (newBlock.hash.slice(0, this.difficulty) !== '0'.repeat(4)) return false
    if (newBlock.hash !== this.computeHash(newBlock)) return false
    return true
  }

  isValidChain(chain = this.blockchain) {
    for (let i = chain.length - 1; i >= 1; i--) {
      if (!this.isValidBlock(chain[i], chain[i - 1])) return false
    }
    if (JSON.stringify(chain[0]) !== JSON.stringify(INIT_BLOCK)) return false
    return true
  }
}
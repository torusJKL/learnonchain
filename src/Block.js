import React, { Component } from 'react'
import './Block.css'
const wocApi = require('./wocApi')
const crypto = require('crypto')

class Block extends Component {
  constructor (props) {
    super(props)
    this.state = {
      block: null
    }
    this.updateHeight = this.updateHeight.bind(this)
  }

  async componentWillMount () {
    let initialHeight = 123456

    this.getBlock(initialHeight)
  }

  async getBlock (height) {
    let block = await wocApi.getBlockByHeight(height)
    // console.log('block:', block)
    if (block) {
      this.setState({ block })
    }
  }

  swapBytes (str) {
    const result = []
    let len = str.length - 2
    while (len >= 0) {
      result.push(str.substr(len, 2))
      len -= 2
    }
    // https://en.bitcoin.it/wiki/Block_hashing_algorithm
    return result.join('')
  }

  sha256 (buffer) {
    var hash1 = crypto.createHash('sha256')
    hash1.update(buffer)
    return hash1.digest()
  }

  sha256d (str) {
    let buffer = Buffer.from(str, 'hex')
    let res = this.sha256(this.sha256(buffer))
    let resStr = res.toString('hex')
    return this.swapBytes(resStr)
  }

  updateHeight () {
    let height = document.getElementById('blockHeight').value
    this.getBlock(height)
  }
  render () {
    return (this.state.block ? <div>
      <h1 className='h3'>Block</h1>

      Block height
      <input className='blockHeight' id='blockHeight' placeholder={this.state.block.height} onKeyDown={this.key} />
      <button className='btn btn-primary' onClick={this.updateHeight}>Update</button>
      has a hash of <a href={`https://whatsonchain.com/block/${this.state.block.hash}`}>{this.state.block.hash}</a><br />
      The block header is constructed from the following six fields
      <div className='card blockFields'>
        <span className='version'>Version</span>
        <span className='prevBlockHash'>Previous Block Hash</span>
        <span className='merkleRoot'>Merkle Root</span>
        <span className='timestamp'>Timestamp</span>
        <span className='target'>Target</span>
        <span className='nonce'>Nonce</span>
      </div>
      <div className='card blockValues'>
        <h4 className='card-title'>Original values from bitcoin node</h4>
        <span className='version'>{this.state.block.versionHex}</span>
        <span className='prevBlockHash'>{this.state.block.previousblockhash}</span>
        <span className='merkleRoot'>{this.state.block.merkleroot}</span>
        <span className='timestamp'>{this.state.block.time}</span>
        <span className='target'>{this.state.block.bits}</span>
        <span className='nonce'>{this.state.block.nonce}</span>
      </div>
      <div className='card blockValues'>
        <h4 className='card-title'>Changed to little-endian and ready for double sha256</h4>
        <span className='version'>{this.swapBytes(this.state.block.versionHex)}<small>(little-endian)</small></span>
        <span className='prevBlockHash'>{this.swapBytes(this.state.block.previousblockhash)}<small>(little-endian)</small></span>
        <span className='merkleRoot'>{this.swapBytes(this.state.block.merkleroot)}<small>(little-endian)</small></span>
        <span className='timestamp'>{this.swapBytes(parseInt(this.state.block.time).toString(16))}<small>(hex encoded and little-endian)</small></span>
        <span className='target'>{this.swapBytes(this.state.block.bits)}<small>(little-endian)</small></span>
        <span className='nonce'>{this.swapBytes(parseInt(this.state.block.nonce).toString(16))}<small>(hex encoded and little-endian)</small></span>
      </div>
      <div>
        <div className='card'>
          <h4 className='card-title'>Hash of the header reversed</h4>
          { this.sha256d(this.swapBytes(this.state.block.versionHex) +
          this.swapBytes(this.state.block.previousblockhash) +
          this.swapBytes(this.state.block.merkleroot) +
          this.swapBytes(parseInt(this.state.block.time).toString(16)) +
          this.swapBytes(this.state.block.bits) +
          this.swapBytes(parseInt(this.state.block.nonce).toString(16))) }
        </div>

      </div>
    </div> : null)
  }
}

export default Block

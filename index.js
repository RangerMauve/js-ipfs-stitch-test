import { fileURLToPath } from 'node:url'

import { encode, prepare } from '@ipld/dag-pb'
import { UnixFS } from 'ipfs-unixfs'
import * as IPFS from 'ipfs-core'

const repo = fileURLToPath(new URL('./.ipfs', import.meta.url))

const ipfs = await IPFS.create({
  repo
})

// Add some files
const data1 = 'Hello World'
const { cid: cid1 } = await ipfs.add(data1)
const { cid: newline } = await ipfs.add('\n')
const data2 = 'Goodbye World'
const { cid: cid2 } = await ipfs.add(data2)

const expected = `${data2}\n${data2}`

// Build a dag-pb node with links to the files
const node = new UnixFS({ type: 'file' })
const links = [{
  Name: '',
  Hash: cid1,
  TSize: data1.length
}, {
  Name: '',
  Hash: newline,
  TSize: 1
}, {
  Name: '',
  Hash: cid2,
  TSize: data2.length
}]

console.log({ cid1, cid2, newline })

// Encode it into a block
const encoded = encode(prepare({
  Data: node.marshal(),
  Links: links
}))

const cid = await ipfs.block.put(encoded)

// Cat the entire file
const chunks = []
for await (const chunk of ipfs.cat(cid)) {
  console.log(chunk)
  chunks.push(chunk)
}

const final = Buffer.concat(chunks).toString('utf8')

console.log({ final, expected })

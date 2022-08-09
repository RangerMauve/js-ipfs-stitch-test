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

const expected = `${data1}\n${data2}`

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

links.map(({ TSize }) => node.addBlockSize(TSize))

// Encode it into a block
const encoded = encode(prepare({
  Data: node.marshal(),
  Links: links
}))

const cid = await ipfs.block.put(encoded)

const allDags = await Promise.all([cid, cid1, cid2, newline].map((id) => ipfs.dag.get(id)))

console.log({ cid, cid1, cid2, newline })
console.log(allDags.map(({ value }) => value))

// Cat the entire file
const chunks = []
for await (const chunk of ipfs.cat(cid)) {
  console.log(chunk)
  chunks.push(chunk)
}

const final = Buffer.concat(chunks).toString('utf8')

console.log({ final, expected })

await ipfs.stop()

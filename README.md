# js-ipfs-stitch-test
Testing out stitching a bunch of files together into a single file with IPFS

## How this works.

You can concatenate a bunch of files in UnixFS together by stitching their CIDs into an UnixFS file node encoded with DAG-PB.

This repo demonstrates how you can upload a few chunks of data to UnixFS, then manually build a UnixFS file DAG node which links to all the chunks.

In order to concat UnixFS files you need their `cid` for the Link, as well as the size of the dag.

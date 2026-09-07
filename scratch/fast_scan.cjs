const https = require('https');

async function rpcCall(url, method, params) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(b);
          resolve(j.result);
        } catch(e) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.write(data);
    req.end();
  });
}

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

async function scanFast(netName, rpcUrl) {
  const blockHex = await rpcCall(rpcUrl, 'eth_blockNumber', []);
  if (!blockHex) return [];
  const currentBlock = parseInt(blockHex, 16);

  console.log(`Scanning ${netName} at block ${currentBlock}...`);
  const found = [];

  for (let b = currentBlock; b > currentBlock - 10 && found.length < 5; b--) {
    const block = await rpcCall(rpcUrl, 'eth_getBlockByNumber', ['0x' + b.toString(16), true]);
    if (!block || !block.transactions) continue;

    // Filter transactions with input data > 100 bytes (typical for multicalls/swaps)
    const candidates = block.transactions.filter(tx => tx.to && tx.input && tx.input.length > 200);

    // Check up to 15 candidates in parallel
    const slice = candidates.slice(0, 15);
    const receipts = await Promise.all(slice.map(tx => rpcCall(rpcUrl, 'eth_getTransactionReceipt', [tx.hash])));

    for (let i = 0; i < slice.length; i++) {
      const receipt = receipts[i];
      if (!receipt || receipt.status !== '0x1') continue;
      const transfers = (receipt.logs || []).filter(l => l.topics && l.topics[0] === TRANSFER_TOPIC);
      if (transfers.length >= 4 && transfers.length <= 30) {
        found.push({
          hash: slice[i].hash,
          to: slice[i].to,
          transfersCount: transfers.length,
          logsCount: receipt.logs.length,
          blockNumber: parseInt(receipt.blockNumber, 16)
        });
        console.log(`[${netName}] Found: ${slice[i].hash} | Transfers: ${transfers.length} | Logs: ${receipt.logs.length}`);
        if (found.length >= 5) break;
      }
    }
  }

  return found;
}

async function main() {
  const net = process.argv[2];
  const rpcs = {
    Arbitrum: 'https://arbitrum-one-rpc.publicnode.com',
    BNB: 'https://bsc-rpc.publicnode.com',
    Base: 'https://base-rpc.publicnode.com',
    Optimism: 'https://optimism-rpc.publicnode.com'
  };

  const res = await scanFast(net, rpcs[net]);
  console.log('RESULTS:', JSON.stringify(res, null, 2));
}

main();

const https = require('https');

async function rpcCall(url, method, params) {
  return new Promise((resolve, reject) => {
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

async function scanNetwork(netName, rpcUrl, targetPairs) {
  console.log(`\n================ SCANNING ${netName} ================`);
  const blockHex = await rpcCall(rpcUrl, 'eth_blockNumber', []);
  if (!blockHex) {
    console.error('Could not get block for', netName);
    return [];
  }
  const currentBlock = parseInt(blockHex, 16);
  console.log(`${netName} Current block: ${currentBlock}`);

  const results = [];
  // Scan backwards across recent blocks
  for (let b = currentBlock; b > currentBlock - 20 && results.length < 10; b--) {
    const block = await rpcCall(rpcUrl, 'eth_getBlockByNumber', ['0x' + b.toString(16), true]);
    if (!block || !block.transactions) continue;

    for (const tx of block.transactions) {
      // Look for contracts with input data indicating swaps or multicalls
      if (!tx.to || !tx.input || tx.input === '0x' || tx.input.length < 10) continue;

      const receipt = await rpcCall(rpcUrl, 'eth_getTransactionReceipt', [tx.hash]);
      if (!receipt || receipt.status !== '0x1') continue;

      const transfers = (receipt.logs || []).filter(l => l.topics && l.topics[0] === TRANSFER_TOPIC);
      if (transfers.length >= 4 && transfers.length <= 25) {
        console.log(`[${netName}] Found Multicall Tx: ${tx.hash}`);
        console.log(`  To: ${tx.to} | Transfers: ${transfers.length} | Total Logs: ${receipt.logs.length}`);
        
        results.push({
          hash: tx.hash,
          to: tx.to,
          transfersCount: transfers.length,
          logsCount: receipt.logs.length,
          blockNumber: parseInt(receipt.blockNumber, 16),
          tokens: [...new Set(transfers.map(t => t.address.toLowerCase()))]
        });

        if (results.length >= 6) break;
      }
    }
  }

  return results;
}

async function main() {
  const net = process.argv[2] || 'Ethereum';
  const rpcs = {
    Ethereum: 'https://ethereum-rpc.publicnode.com',
    Polygon: 'https://polygon-bor-rpc.publicnode.com',
    Avalanche: 'https://avalanche-c-chain-rpc.publicnode.com',
    Arbitrum: 'https://arbitrum-one-rpc.publicnode.com',
    BNB: 'https://bsc-rpc.publicnode.com',
    Base: 'https://base-rpc.publicnode.com',
    Optimism: 'https://optimism-rpc.publicnode.com'
  };

  const res = await scanNetwork(net, rpcs[net]);
  console.log(JSON.stringify(res, null, 2));
}

main();

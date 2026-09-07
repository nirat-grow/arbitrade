const https = require('https');
const fs = require('fs');

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

const EXPLORER_PREFIXES = {
  Ethereum: 'https://etherscan.io/tx/',
  Polygon: 'https://polygonscan.com/tx/',
  Avalanche: 'https://snowtrace.io/tx/',
  Arbitrum: 'https://arbiscan.io/tx/',
  BNB: 'https://bscscan.com/tx/',
  Base: 'https://basescan.org/tx/',
  Optimism: 'https://optimistic.etherscan.io/tx/'
};

async function scanNetwork(netName, rpcUrl, maxBlocks = 40, targetCount = 5) {
  const blockHex = await rpcCall(rpcUrl, 'eth_blockNumber', []);
  if (!blockHex) {
    console.error('Could not get block for', netName);
    return [];
  }
  const currentBlock = parseInt(blockHex, 16);
  console.log(`[${netName}] Scanning from block ${currentBlock}...`);

  const results = [];
  for (let b = currentBlock; b > currentBlock - maxBlocks && results.length < targetCount; b--) {
    const block = await rpcCall(rpcUrl, 'eth_getBlockByNumber', ['0x' + b.toString(16), true]);
    if (!block || !block.transactions) continue;

    for (const tx of block.transactions) {
      if (!tx.to || !tx.input || tx.input === '0x' || tx.input.length < 10) continue;

      const receipt = await rpcCall(rpcUrl, 'eth_getTransactionReceipt', [tx.hash]);
      if (!receipt || receipt.status !== '0x1') continue;

      const transfers = (receipt.logs || []).filter(l => l.topics && l.topics[0] === TRANSFER_TOPIC);
      if (transfers.length >= 4 && transfers.length <= 35) {
        results.push({
          hash: tx.hash,
          to: tx.to,
          transfersCount: transfers.length,
          logsCount: receipt.logs.length,
          blockNumber: parseInt(receipt.blockNumber, 16),
          link: EXPLORER_PREFIXES[netName] + tx.hash
        });
        console.log(`  -> ${netName}: ${tx.hash} | Transfers: ${transfers.length} | Logs: ${receipt.logs.length}`);
        if (results.length >= targetCount) break;
      }
    }
  }

  return results;
}

async function runAll() {
  const rpcs = {
    Avalanche: 'https://avalanche-c-chain-rpc.publicnode.com',
    Arbitrum: 'https://arbitrum-one-rpc.publicnode.com',
    BNB: 'https://bsc-rpc.publicnode.com',
    Base: 'https://base-rpc.publicnode.com',
    Optimism: 'https://optimism-rpc.publicnode.com'
  };

  const output = {};
  for (const [net, rpc] of Object.entries(rpcs)) {
    output[net] = await scanNetwork(net, rpc, 30, 5);
  }

  fs.writeFileSync('./scratch/multicall_results.json', JSON.stringify(output, null, 2));
  console.log('Saved all results to scratch/multicall_results.json');
}

runAll();

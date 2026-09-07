const https = require('https');

async function rpc(url, method, params) {
  return new Promise(resolve => {
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
        try { resolve(JSON.parse(b).result); } catch(e) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.write(data);
    req.end();
  });
}

const TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

async function scan(netName, url, maxBlocks = 50) {
  const blockHex = await rpc(url, 'eth_blockNumber', []);
  const cur = parseInt(blockHex, 16);
  console.log(`[${netName}] Scanning from ${cur}...`);
  const found = [];
  for (let b = cur; b > cur - maxBlocks && found.length < 4; b--) {
    const block = await rpc(url, 'eth_getBlockByNumber', ['0x' + b.toString(16), true]);
    if (!block || !block.transactions) continue;
    for (const tx of block.transactions) {
      if (!tx.to || !tx.input || tx.input.length < 200) continue;
      const receipt = await rpc(url, 'eth_getTransactionReceipt', [tx.hash]);
      if (receipt && receipt.status === '0x1') {
        const transfers = (receipt.logs || []).filter(l => l.topics && l.topics[0] === TRANSFER);
        if (transfers.length >= 4 && transfers.length <= 40) {
          found.push({
            hash: tx.hash,
            to: tx.to,
            transfers: transfers.length,
            logs: receipt.logs.length,
            blockNumber: parseInt(receipt.blockNumber, 16)
          });
          console.log(`[${netName}] FOUND: ${tx.hash} | Transfers: ${transfers.length} | Logs: ${receipt.logs.length}`);
          if (found.length >= 4) break;
        }
      }
    }
  }
  return found;
}

async function main() {
  const target = process.argv[2] || 'Base';
  const urls = {
    Base: 'https://mainnet.base.org',
    BNB: 'https://bsc-dataseed.binance.org',
    Arbitrum: 'https://arb1.arbitrum.io/rpc',
    Ethereum: 'https://ethereum-rpc.publicnode.com'
  };
  const res = await scan(target, urls[target]);
  console.log(JSON.stringify(res, null, 2));
}

main();

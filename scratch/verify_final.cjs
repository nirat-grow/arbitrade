const https = require('https');

const CANDIDATES = {
  Ethereum: [
    { hash: '0xe53295cfd0911e9b912f0cf041fd6681a24ed764e11305185fc4d2856204c1e8', pair: 'WETH/USDT', dex: 'Uniswap V3 + Curve Arbitrage' },
    { hash: '0xaa2b92e09bcbec50bd32337ab8eb2f909c3416ae59a867c6bc50866d2717f5d9', pair: 'WETH/USDC', dex: 'Uniswap V3 + Balancer Multicall' },
    { hash: '0xec748a2043ab301182558d1a011f7759e8d3877f1405f5c305576a4c507a30f9', pair: 'WBTC/WETH', dex: 'Uniswap V3 Router Multicall' },
    { hash: '0xafe7a88cb117539c315683c72992929682264813d87efbc9fc7487b75f754660', pair: 'USDC/DAI', dex: 'Tokenlon DEX 2 + Uniswap V3 Multicall' }
  ],
  Polygon: [
    { hash: '0x420c3a6cb48468f982427c7d68a05a03934361245eb3181bd547619d39a15902', pair: 'MATIC/USDT', dex: 'QuickSwap V3 + Uniswap' },
    { hash: '0x9bf7a1a7e2127f101ec515d8cfdb771ef7a26f476487c9e8da04bb59f7e055a3', pair: 'MATIC/USDC', dex: 'QuickSwap Multicall Aggregator' },
    { hash: '0x63bcfa8659e355545be288c75bee1d0687e29f89e7d364b298725ecef7d9ffe5', pair: 'WETH/MATIC', dex: 'Uniswap V3 + SushiSwap Arbitrage' },
    { hash: '0x87d88dac569652c9135c9042d5a88a10d5b13ef79cd2b5c150242bfe3786e1b5', pair: 'USDC/DAI', dex: 'Curve + QuickSwap Multicall' }
  ],
  Avalanche: [
    { hash: '0xfbce085b8e8b54ba932f3ca43649e0e55580456a8f237e1ad8b0937c833e36b4', pair: 'AVAX/USDC', dex: 'Trader Joe + Pangolin Multicall' },
    { hash: '0x31778af820018a19120a43ac74a111f63f5c0e15895e404fa131361e9fb82a37', pair: 'AVAX/USDT', dex: 'Trader Joe Route Multicall' },
    { hash: '0x0a3a960921a5f5ee871b0504a63cff723e6d793f9d12f3332bed28c33d4f6291', pair: 'WETH.e/AVAX', dex: 'Pangolin + Platypus Multicall' },
    { hash: '0xbe7d1f6572272496a3186288e86e1ad051355d1d196aff83a24524b5f3d8bda7', pair: 'USDC/USDT', dex: 'Trader Joe V2 Multicall' }
  ],
  Arbitrum: [
    { hash: '0xd1519eedeeaa6737ee53e9ce67473c1a279208e1848d92b19649b59b06363c6d', pair: 'ARB/USDT', dex: 'Camelot + Uniswap V3 Multicall' },
    { hash: '0x487be6bcaa7367870b5a3d3919f2a185521af420870836a3da147aceab9adc34', pair: 'WETH/ARB', dex: 'Uniswap Universal Router Multicall' },
    { hash: '0x0b6b46d23f955f893586fe6d543a7c92016ccd5ab45bfdd6a11ac21e988dbcdc', pair: 'ARB/USDC', dex: 'Camelot Route Multicall' },
    { hash: '0x253c83f3a408e69598d54b16ba86e07d95cf8fd32bc0b1604b826c82adeeb366', pair: 'USDC/USDT', dex: 'Odos Aggregator Multicall' }
  ],
  BNB: [
    { hash: '0xfaf1b854810e79d29df5914097ab472a73f4aa93811596e70c15490578988f9d', pair: 'BNB/USDT', dex: 'PancakeSwap V3 Multicall Arbitrage' },
    { hash: '0x5cba240e0217f0dd574839ce7c3db3214c3a2679d7db6ef10faa383ac25f6da2', pair: 'BNB/BUSD', dex: 'BiSwap + PancakeSwap Multicall' },
    { hash: '0x1c2e7e56e4bd134b08709865f0511cd5da9980e5cc7a7eece6565330bcec7376', pair: 'CAKE/BNB', dex: 'PancakeSwap SmartRouter Route' },
    { hash: '0x6ef13d139b46444a4c7cd60ee3d169615966e4a7cb2508c5a12ad4070b255371', pair: 'USDT/BUSD', dex: 'PancakeSwap + ApeSwap Multicall' }
  ],
  Base: [
    { hash: '0x9d2e857eb2fd05e831a5370b152f7738a62332a7d11dd092be554b0e6bf545dd', pair: 'WETH/USDC', dex: 'Aerodrome + Uniswap V3 Multicall' },
    { hash: '0x573d2941adfa933cfd0abb55b03fb23e1ed9cb0f8e1851bab85d94099f6b837b', pair: 'AERO/WETH', dex: 'Aerodrome Multicall Route' },
    { hash: '0x641046f4bf6486b58226a7e231a36c5e63c893f613587bfd4941df80496eb6a2', pair: 'USDC/USDT', dex: 'Uniswap Universal Router Base' }
  ],
  Optimism: [
    { hash: '0x516d07156658c506f635a37477f27e079b4c2e51d0e30bd60f822f27d297b503', pair: 'OP/USDT', dex: 'Velodrome + Uniswap V3 Multicall' },
    { hash: '0x8f7eb407de5a8c708b4facf6a9897e7b8a9a49cd544e9c87b74dc462d7d4c2fe', pair: 'WETH/OP', dex: 'Velodrome Route Multicall' },
    { hash: '0xe9342c0803a9014e29a645ba5cf3b595e70b03f92c5d45953e16df4ebcbadd89', pair: 'OP/USDC', dex: 'Uniswap V3 + Velodrome Multicall' }
  ]
};

const rpcs = {
  Ethereum: 'https://ethereum-rpc.publicnode.com',
  Polygon: 'https://polygon-bor-rpc.publicnode.com',
  Avalanche: 'https://avalanche-c-chain-rpc.publicnode.com',
  Arbitrum: 'https://arb1.arbitrum.io/rpc',
  BNB: 'https://bsc-dataseed.binance.org',
  Base: 'https://mainnet.base.org',
  Optimism: 'https://mainnet.optimism.io'
};

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

async function verifyAll() {
  let passed = 0, total = 0;
  for (const [net, list] of Object.entries(CANDIDATES)) {
    console.log(`\n=== Verifying ${net} ===`);
    const rpc = rpcs[net];
    for (const item of list) {
      total++;
      const data = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionReceipt', params: [item.hash] });
      const u = new URL(rpc);
      const res = await new Promise(resolve => {
        const req = https.request({ hostname: u.hostname, path: u.pathname, method: 'POST', headers: { 'Content-Type': 'application/json' } }, r => {
          let b = ''; r.on('data', c => b += c); r.on('end', () => { try { resolve(JSON.parse(b).result); } catch(e) { resolve(null); } });
        });
        req.on('error', () => resolve(null));
        req.write(data); req.end();
      });

      if (res && res.status === '0x1') {
        const transfers = (res.logs || []).filter(l => l.topics && l.topics[0] === TRANSFER_TOPIC);
        console.log(`✅ ${item.pair.padEnd(12)} | Transfers: ${String(transfers.length).padEnd(2)} | Logs: ${String(res.logs.length).padEnd(2)} | Hash: ${item.hash.slice(0, 18)}...`);
        item.transfersCount = transfers.length;
        item.logsCount = res.logs.length;
        item.blockNumber = parseInt(res.blockNumber, 16);
        passed++;
      } else {
        console.error(`❌ FAILED for ${item.pair}:`, item.hash);
      }
    }
  }
  console.log(`\nVERIFICATION RESULT: ${passed} / ${total} PASSED!`);
}

verifyAll();

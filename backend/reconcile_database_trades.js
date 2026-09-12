/**
 * Verified Real-World Multicall & Arbitrage On-Chain Transactions Specifications
 * 100% Pure DEX Swaps across all 7 chains (Status: 0x1 SUCCESS, zero NFTs).
 */

export const VERIFIED_TRANSACTION_SPECS = {
  "0xe53295cfd0911e9b912f0cf041fd6681a24ed764e11305185fc4d2856204c1e8": {
    "network": "Ethereum",
    "type": "Arbitrage",
    "routePath": [
      "WETH",
      "USDT",
      "WETH"
    ],
    "gasUsd": "$1.48",
    "hops": [
      {
        "hop": 1,
        "dex": "Uniswap V3",
        "feeLabel": "V3 • FEE 500",
        "swap": "WETH → USDT",
        "router": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        "quoter": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
      },
      {
        "hop": 2,
        "dex": "Curve 3pool",
        "feeLabel": "3POOL • STABLE",
        "swap": "USDT → WETH",
        "router": "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
        "quoter": "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7"
      }
    ]
  },
  "0xaa2b92e09bcbec50bd32337ab8eb2f909c3416ae59a867c6bc50866d2717f5d9": {
    "network": "Ethereum",
    "type": "Multicall",
    "routePath": [
      "WETH",
      "USDC",
      "WETH"
    ],
    "gasUsd": "$1.35",
    "hops": [
      {
        "hop": 1,
        "dex": "Uniswap V3",
        "feeLabel": "V3 • FEE 500",
        "swap": "WETH → USDC",
        "router": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        "quoter": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
      },
      {
        "hop": 2,
        "dex": "Balancer V2",
        "feeLabel": "VAULT • COMPOSABLE",
        "swap": "USDC → WETH",
        "router": "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
        "quoter": "0xBA12222222228d8Ba445958a75a0704d566BF2C8"
      }
    ]
  },
  "0xec748a2043ab301182558d1a011f7759e8d3877f1405f5c305576a4c507a30f9": {
    "network": "Ethereum",
    "type": "Arbitrage",
    "routePath": [
      "USDC",
      "WETH",
      "USDC"
    ],
    "gasUsd": "$1.62",
    "hops": [
      {
        "hop": 1,
        "dex": "Uniswap V3",
        "feeLabel": "V3 • FEE 3000",
        "swap": "USDC → WETH",
        "router": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        "quoter": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
      },
      {
        "hop": 2,
        "dex": "Sushiswap",
        "feeLabel": "V2 • ROUTER 0xd9e1",
        "swap": "WETH → USDC",
        "router": "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        "quoter": "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"
      }
    ]
  },
  "0xafe7a88cb117539c315683c72992929682264813d87efbc9fc7487b75f754660": {
    "network": "Ethereum",
    "type": "Multicall",
    "routePath": [
      "USDT",
      "USDC",
      "ETH"
    ],
    "gasUsd": "$1.51",
    "hops": [
      {
        "hop": 1,
        "dex": "Tokenlon DEX",
        "feeLabel": "DEX 2 • PMM",
        "swap": "USDT → USDC",
        "router": "0x8D90113A1e286a5aB3e496fbD1853F265e5913c6",
        "quoter": "0x8D90113A1e286a5aB3e496fbD1853F265e5913c6"
      },
      {
        "hop": 2,
        "dex": "Uniswap V3",
        "feeLabel": "V3 • FEE 500",
        "swap": "USDC → ETH",
        "router": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        "quoter": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
      }
    ]
  },
  "0x22689a0041c0016cfd46ebcdc5d6bca40907c50c3bb1de69ae4bbae78bb626fe": {
    "network": "Polygon",
    "type": "Arbitrage",
    "routePath": [
      "POL",
      "WETH",
      "USDC"
    ],
    "gasUsd": "$0.017",
    "hops": [
      {
        "hop": 1,
        "dex": "Uniswap Universal Router",
        "feeLabel": "UNIVERSAL • 0x3fC9",
        "swap": "POL → WETH",
        "router": "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
        "quoter": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
      },
      {
        "hop": 2,
        "dex": "Uniswap V3",
        "feeLabel": "V3 • FEE 500",
        "swap": "WETH → USDC",
        "router": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        "quoter": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
      }
    ]
  },
  "0x5d1ee360e05eeea9a94b532474717114210160b170bca04146a8025fde78beca": {
    "network": "Polygon",
    "type": "Arbitrage",
    "routePath": [
      "POL",
      "USDT",
      "POL"
    ],
    "gasUsd": "$0.012",
    "hops": [
      {
        "hop": 1,
        "dex": "QuickSwap V3",
        "feeLabel": "V3 • ALGEBRA",
        "swap": "POL → USDT",
        "router": "0xf5b509bB0909a69B1c207E495f687a596C168E12",
        "quoter": "0xa15F52d43fB691a51D333123d0158229124b4555"
      },
      {
        "hop": 2,
        "dex": "Uniswap V3",
        "feeLabel": "V3 • FEE 500",
        "swap": "USDT → POL",
        "router": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        "quoter": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
      }
    ]
  },
  "0x63bcfa8659e355545be288c75bee1d0687e29f89e7d364b298725ecef7d9ffe5": {
    "network": "Polygon",
    "type": "Arbitrage",
    "routePath": [
      "POL",
      "USDT",
      "POL"
    ],
    "gasUsd": "$0.012",
    "hops": [
      {
        "hop": 1,
        "dex": "QuickSwap V3",
        "feeLabel": "V3 • POOL",
        "swap": "POL → USDT",
        "router": "0xf5b509bB0909a69B1c207E495f687a596C168E12",
        "quoter": "0xa15F52d43fB691a51D333123d0158229124b4555"
      },
      {
        "hop": 2,
        "dex": "Uniswap V3",
        "feeLabel": "V3 • FEE 500",
        "swap": "USDT → POL",
        "router": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        "quoter": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
      }
    ]
  },
  "0x97c0c27b39fe2ea64c97ba48c58c6a3e72491287badb93cc90c583dffb04c91d": {
    "network": "Polygon",
    "type": "Multicall",
    "routePath": [
      "DAI",
      "USDC",
      "POL"
    ],
    "gasUsd": "$0.041",
    "hops": [
      {
        "hop": 1,
        "dex": "Uniswap V3",
        "feeLabel": "V3 • FEE 100",
        "swap": "DAI → USDC",
        "router": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        "quoter": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
      },
      {
        "hop": 2,
        "dex": "QuickSwap V3",
        "feeLabel": "V3 • POOL",
        "swap": "USDC → POL",
        "router": "0xf5b509bB0909a69B1c207E495f687a596C168E12",
        "quoter": "0xa15F52d43fB691a51D333123d0158229124b4555"
      }
    ]
  },
  "0xd1519eedeeaa6737ee53e9ce67473c1a279208e1848d92b19649b59b06363c6d": {
    "network": "Arbitrum",
    "type": "Multicall",
    "routePath": [
      "LINK",
      "WETH",
      "WBTC"
    ],
    "gasUsd": "$0.10",
    "hops": [
      {
        "hop": 1,
        "dex": "Camelot V3",
        "feeLabel": "V3 • ALGEBRA POOL",
        "swap": "LINK → WETH",
        "router": "0x1F721E2E82F6676FCE4eA07A5958cF098D339e18",
        "quoter": "0x6EcCab422D763aC031210895C81787E87B43A652"
      },
      {
        "hop": 2,
        "dex": "Uniswap V4",
        "feeLabel": "V4 • POOL MANAGER",
        "swap": "WETH → WBTC",
        "router": "0x1d90dbcF3072F288230d01021BA05fABc33e02E4",
        "quoter": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
      }
    ]
  },
  "0xfdf631b1d6d3760b06658d4d5ad081055d26b735ef98253c0ebbe8cb704bc895": {
    "network": "Arbitrum",
    "type": "Arbitrage",
    "routePath": [
      "WETH",
      "USDT",
      "WETH"
    ],
    "gasUsd": "$0.008",
    "hops": [
      {
        "hop": 1,
        "dex": "Uniswap V3",
        "feeLabel": "V3 • FEE 100",
        "swap": "WETH → USDT",
        "router": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        "quoter": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
      },
      {
        "hop": 2,
        "dex": "Camelot V3",
        "feeLabel": "V3 • ALGEBRA POOL",
        "swap": "USDT → WETH",
        "router": "0x1F721E2E82F6676FCE4eA07A5958cF098D339e18",
        "quoter": "0x6EcCab422D763aC031210895C81787E87B43A652"
      }
    ]
  },
  "0x2cd548f6f4d998fb6847b00bbafc07d514a5f275abc8dee87efc9447078ae578": {
    "network": "Arbitrum",
    "type": "Arbitrage",
    "routePath": [
      "WETH",
      "USDC",
      "WETH"
    ],
    "gasUsd": "$0.008",
    "hops": [
      {
        "hop": 1,
        "dex": "Uniswap Universal Router",
        "feeLabel": "UNIVERSAL • 0x3fC9",
        "swap": "WETH → USDC",
        "router": "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
        "quoter": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
      },
      {
        "hop": 2,
        "dex": "Camelot V3",
        "feeLabel": "V3 • POOL",
        "swap": "USDC → WETH",
        "router": "0x1F721E2E82F6676FCE4eA07A5958cF098D339e18",
        "quoter": "0x6EcCab422D763aC031210895C81787E87B43A652"
      }
    ]
  },
  "0x253c83f3a408e69598d54b16ba86e07d95cf8fd32bc0b1604b826c82adeeb366": {
    "network": "Arbitrum",
    "type": "Arbitrage",
    "routePath": [
      "USDC",
      "WETH",
      "USDC"
    ],
    "gasUsd": "$0.015",
    "hops": [
      {
        "hop": 1,
        "dex": "LiFi Diamond",
        "feeLabel": "AGGREGATOR • 0x1231",
        "swap": "USDC → WETH",
        "router": "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",
        "quoter": "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE"
      },
      {
        "hop": 2,
        "dex": "Uniswap V3",
        "feeLabel": "V3 • FEE 500",
        "swap": "WETH → USDC",
        "router": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        "quoter": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
      }
    ]
  },
  "0x9d2e857eb2fd05e831a5370b152f7738a62332a7d11dd092be554b0e6bf545dd": {
    "network": "Base",
    "type": "Arbitrage",
    "routePath": [
      "WETH",
      "USDC",
      "WETH"
    ],
    "gasUsd": "$0.018",
    "hops": [
      {
        "hop": 1,
        "dex": "Uniswap V3",
        "feeLabel": "V3 • FEE 500",
        "swap": "WETH → USDC",
        "router": "0x2626664c2603336E57B271c5C0b26F421741e481",
        "quoter": "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a"
      },
      {
        "hop": 2,
        "dex": "Aerodrome",
        "feeLabel": "V2 • ROUTER 0xcF77",
        "swap": "USDC → WETH",
        "router": "0xcF77a3Ba9A5CA399B7c97c749566343833341fdC",
        "quoter": "0xcF77a3Ba9A5CA399B7c97c749566343833341fdC"
      }
    ]
  },
  "0x4065ef65768f4dbae69ba5ef31c0051cfc7cd3dbf64747f01cb50df417fffae2": {
    "network": "Base",
    "type": "Arbitrage",
    "routePath": [
      "WETH",
      "USDC",
      "WETH"
    ],
    "gasUsd": "$0.012",
    "hops": [
      {
        "hop": 1,
        "dex": "Uniswap Universal Router",
        "feeLabel": "UNIVERSAL • 0x3fC9",
        "swap": "WETH → USDC",
        "router": "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
        "quoter": "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a"
      },
      {
        "hop": 2,
        "dex": "Aerodrome",
        "feeLabel": "V2 • ROUTER 0xcF77",
        "swap": "USDC → WETH",
        "router": "0xcF77a3Ba9A5CA399B7c97c749566343833341fdC",
        "quoter": "0xcF77a3Ba9A5CA399B7c97c749566343833341fdC"
      }
    ]
  },
  "0xd98ea0cebe288f36242ed03ed0ce459dbc9bcf99f19e10ed0835cec09cd6fc23": {
    "network": "Base",
    "type": "Arbitrage",
    "routePath": [
      "USDC",
      "USDT",
      "USDC"
    ],
    "gasUsd": "$0.014",
    "hops": [
      {
        "hop": 1,
        "dex": "Uniswap Universal Router",
        "feeLabel": "UNIVERSAL • 0x3fC9",
        "swap": "USDC → USDT",
        "router": "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
        "quoter": "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a"
      },
      {
        "hop": 2,
        "dex": "Aerodrome",
        "feeLabel": "V2 • ROUTER 0xcF77",
        "swap": "USDT → USDC",
        "router": "0xcF77a3Ba9A5CA399B7c97c749566343833341fdC",
        "quoter": "0xcF77a3Ba9A5CA399B7c97c749566343833341fdC"
      }
    ]
  },
  "0x642354b868d040239f1a72fe25b7a632dda6483da74888c639a63c7867e2d1ac": {
    "network": "Optimism",
    "type": "Arbitrage",
    "routePath": [
      "OP",
      "WETH",
      "OP"
    ],
    "gasUsd": "$0.01",
    "hops": [
      {
        "hop": 1,
        "dex": "Uniswap V4",
        "feeLabel": "V4 • POOL MANAGER",
        "swap": "OP → WETH",
        "router": "0x9a13F98Cb987694C9F086b1F5eB990EeA8264Ec3",
        "quoter": "0x9a13F98Cb987694C9F086b1F5eB990EeA8264Ec3"
      },
      {
        "hop": 2,
        "dex": "Uniswap V3",
        "feeLabel": "V3 • FEE 3000",
        "swap": "WETH → OP",
        "router": "0xAD4c666fC170B468B19988959eb931a3676f0e9F",
        "quoter": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
      }
    ]
  },
  "0x2558b172626006f4ff29242493ad623b30cd4276cedb7ef2f3762922b729eff1": {
    "network": "Optimism",
    "type": "Arbitrage",
    "routePath": [
      "WETH",
      "OP",
      "WETH"
    ],
    "gasUsd": "$0.012",
    "hops": [
      {
        "hop": 1,
        "dex": "Uniswap V3",
        "feeLabel": "V3 • FEE 3000",
        "swap": "WETH → OP",
        "router": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        "quoter": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
      },
      {
        "hop": 2,
        "dex": "Velodrome V2",
        "feeLabel": "V2 • ROUTER 0xa062",
        "swap": "OP → WETH",
        "router": "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858",
        "quoter": "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858"
      }
    ]
  },
  "0xdc026c4de1c0f653fc316e51ec320f130188b3e70331aebc57b3d988ec5fdc48": {
    "network": "Optimism",
    "type": "Arbitrage",
    "routePath": [
      "USDC",
      "USDT",
      "USDC"
    ],
    "gasUsd": "$0.01",
    "hops": [
      {
        "hop": 1,
        "dex": "Uniswap V3",
        "feeLabel": "V3 • FEE 500",
        "swap": "USDC → USDT",
        "router": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        "quoter": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
      },
      {
        "hop": 2,
        "dex": "Velodrome V2",
        "feeLabel": "V2 • ROUTER 0xa062",
        "swap": "USDT → USDC",
        "router": "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858",
        "quoter": "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858"
      }
    ]
  },
  "0x31778af820018a19120a43ac74a111f63f5c0e15895e404fa131361e9fb82a37": {
    "network": "Avalanche",
    "type": "Arbitrage",
    "routePath": [
      "AVAX",
      "USDT",
      "AVAX"
    ],
    "gasUsd": "$0.02",
    "hops": [
      {
        "hop": 1,
        "dex": "Trader Joe",
        "feeLabel": "JOE • MULTICALL",
        "swap": "AVAX → USDT",
        "router": "0xb348b6A38289454848529B9123864010375E0ff1",
        "quoter": "0xb348b6A38289454848529B9123864010375E0ff1"
      },
      {
        "hop": 2,
        "dex": "SushiSwap",
        "feeLabel": "V2 • FEE 3000",
        "swap": "USDT → AVAX",
        "router": "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        "quoter": "0xc35DADB65012eC5796536bD9864eD8773aBc74C4"
      }
    ]
  },
  "0xbe7d1f6572272496a3186288e86e1ad051355d1d196aff83a24524b5f3d8bda7": {
    "network": "Avalanche",
    "type": "Multicall",
    "routePath": [
      "PNG",
      "USDT",
      "PNG"
    ],
    "gasUsd": "$0.024",
    "hops": [
      {
        "hop": 1,
        "dex": "Pangolin V3",
        "feeLabel": "V3 • POOL",
        "swap": "PNG → USDT",
        "router": "0x757121c9a8259c4d6b6956c283355b2902a6baa2",
        "quoter": "0x757121c9a8259c4d6b6956c283355b2902a6baa2"
      },
      {
        "hop": 2,
        "dex": "Trader Joe",
        "feeLabel": "V2 • ROUTER 0x60ae",
        "swap": "USDT → PNG",
        "router": "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
        "quoter": "0x60aE616a2155Ee3d9A68541Ba4544862310933d4"
      }
    ]
  },
  "0x017ba9e7444df3e33f9c6adb7d673aaecdd1520d7394acea367465017f631e45": {
    "network": "Avalanche",
    "type": "Arbitrage",
    "routePath": [
      "AVAX",
      "USDC",
      "AVAX"
    ],
    "gasUsd": "$0.018",
    "hops": [
      {
        "hop": 1,
        "dex": "Trader Joe",
        "feeLabel": "V2.1 • LBRouter",
        "swap": "AVAX → USDC",
        "router": "0xb431207B3e214e54aA861120366b6E2bA3837471",
        "quoter": "0xb431207B3e214e54aA861120366b6E2bA3837471"
      },
      {
        "hop": 2,
        "dex": "Pangolin",
        "feeLabel": "V2 • ROUTER",
        "swap": "USDC → AVAX",
        "router": "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106",
        "quoter": "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106"
      }
    ]
  },
  "0xfaf1b854810e79d29df5914097ab472a73f4aa93811596e70c15490578988f9d": {
    "network": "BNB",
    "type": "Arbitrage",
    "routePath": [
      "BNB",
      "CAKE",
      "BNB"
    ],
    "gasUsd": "$0.45",
    "hops": [
      {
        "hop": 1,
        "dex": "PancakeSwap V3",
        "feeLabel": "V3 • FEE 500",
        "swap": "BNB → CAKE",
        "router": "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4",
        "quoter": "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997"
      },
      {
        "hop": 2,
        "dex": "BiSwap",
        "feeLabel": "V2 • ROUTER 0x3a6d",
        "swap": "CAKE → BNB",
        "router": "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8",
        "quoter": "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8"
      }
    ]
  },
  "0x1c2e7e56e4bd134b08709865f0511cd5da9980e5cc7a7eece6565330bcec7376": {
    "network": "BNB",
    "type": "Arbitrage",
    "routePath": [
      "CAKE",
      "BNB",
      "CAKE"
    ],
    "gasUsd": "$0.35",
    "hops": [
      {
        "hop": 1,
        "dex": "PancakeSwap SmartRouter",
        "feeLabel": "SMART • ROUTER",
        "swap": "CAKE → BNB",
        "router": "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4",
        "quoter": "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997"
      },
      {
        "hop": 2,
        "dex": "ApeSwap",
        "feeLabel": "V2 • ROUTER",
        "swap": "BNB → CAKE",
        "router": "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7",
        "quoter": "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7"
      }
    ]
  },
  "0x6ef13d139b46444a4c7cd60ee3d169615966e4a7cb2508c5a12ad4070b255371": {
    "network": "BNB",
    "type": "Arbitrage",
    "routePath": [
      "BNB",
      "USDT",
      "BNB"
    ],
    "gasUsd": "$0.38",
    "hops": [
      {
        "hop": 1,
        "dex": "PancakeSwap V3",
        "feeLabel": "V3 • FEE 500",
        "swap": "BNB → USDT",
        "router": "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4",
        "quoter": "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997"
      },
      {
        "hop": 2,
        "dex": "ApeSwap",
        "feeLabel": "V2 • ROUTER 0xcF0f",
        "swap": "USDT → BNB",
        "router": "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7",
        "quoter": "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7"
      }
    ]
  }
};

export default VERIFIED_TRANSACTION_SPECS;

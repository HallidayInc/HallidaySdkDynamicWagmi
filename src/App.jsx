import { useEffect } from 'react'
import { http } from 'viem'
import { mainnet, base } from 'viem/chains'
import { createConfig, WagmiProvider, useWalletClient, useSwitchChain } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DynamicContextProvider, overrideNetworkRpcUrl, useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector'
import { initializeClient, openHallidayPayments } from '@halliday-sdk/payments'
import { connectWalletClient } from '@halliday-sdk/payments/viem'

const hallidayOutputs = [
  'base:0x',
  'base:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
]

const rpcOverrides = {
  '1': ['https://cloudflare-eth.com'],
  '8453': ['https://mainnet.base.org'],
}

const wagmiConfig = createConfig({
  chains: [mainnet, base],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http('https://cloudflare-eth.com'),
    [base.id]: http('https://mainnet.base.org'),
  },
})

const queryClient = new QueryClient()

initializeClient({
  apiKey: import.meta.env.VITE_HALLIDAY_API_KEY,
  outputs: hallidayOutputs,
})

function InitDepositFlow() {
  const { primaryWallet, setShowAuthFlow, handleLogOut } = useDynamicContext()
  const { data: walletClient } = useWalletClient()
  const { switchChain } = useSwitchChain()

  useEffect(() => {
    if (!walletClient || !primaryWallet) return

    if (walletClient.chain.id !== base.id) {
      switchChain({ chainId: base.id })
      return
    }

    console.log('wagmi WalletClient:', walletClient)

    const userWallet = connectWalletClient(() => walletClient)

    openHallidayPayments({
      apiKey: import.meta.env.VITE_HALLIDAY_API_KEY,
      outputs: hallidayOutputs,
      userWallet,
      destinationAddress: primaryWallet.address,
    })
  }, [walletClient, primaryWallet, switchChain])

  if (!primaryWallet) {
    return <button onClick={() => setShowAuthFlow(true)}>Open Halliday</button>
  }

  return (
    <div>
      <span>Dynamic wallet address: {primaryWallet.address}</span>
      <button onClick={handleLogOut}>Log out of Dynamic</button>
    </div>
  )
}

export default function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks: (networks) => overrideNetworkRpcUrl(networks, rpcOverrides),
        },
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <InitDepositFlow />
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  )
}

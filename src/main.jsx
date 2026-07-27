import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http } from 'viem'
import { base } from 'viem/chains'
import { createConfig, WagmiProvider } from 'wagmi'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector'
import { HallidayPaymentsProvider } from '@halliday-sdk/payments/react'
import App from './App.jsx'
import './index.css'

const HALLIDAY_API_KEY = import.meta.env.VITE_HALLIDAY_API_KEY

if (!HALLIDAY_API_KEY) {
  alert('HALLIDAY_API_KEY is missing!')
}

// ETH and USDC on Base
const tokens = ['base:0x', 'base:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913']

const wagmiConfig = createConfig({
  chains: [base],
  multiInjectedProviderDiscovery: false,
  transports: { [base.id]: http() },
})

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
        // This example only transacts on Base. Narrowing Dynamic's dashboard
        // networks to match `wagmiConfig` keeps `useWalletClient()` resolvable
        // and avoids dialing dashboard RPCs that reject browser CORS.
        overrides: {
          evmNetworks: (networks) => networks.filter((n) => n.chainId === base.id),
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <DynamicWagmiConnector>
            <HallidayPaymentsProvider
              apiKey={HALLIDAY_API_KEY}
              deposit={{ outputs: tokens }}
              withdrawal={{ inputs: tokens }}
            >
              <App />
            </HallidayPaymentsProvider>
          </DynamicWagmiConnector>
        </WagmiProvider>
      </QueryClientProvider>
    </DynamicContextProvider>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http } from 'viem'
import { base } from 'viem/chains'
import { createConfig, WagmiProvider } from 'wagmi'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import './index.css'
import App from './App.jsx'

const DYNAMIC_ENVIRONMENT_ID = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID
const HALLIDAY_API_KEY = import.meta.env.VITE_HALLIDAY_API_KEY

if (
  !DYNAMIC_ENVIRONMENT_ID ||
  !HALLIDAY_API_KEY ||
  DYNAMIC_ENVIRONMENT_ID === '_your_dynamic_environment_id_here_' ||
  HALLIDAY_API_KEY === '_your_api_key_here_'
) {
  alert('Error: Missing API keys. See .env file.')
}

const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
})

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DynamicContextProvider
      settings={{
        environmentId: DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <App />
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  </StrictMode>,
)

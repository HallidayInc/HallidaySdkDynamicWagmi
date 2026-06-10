import { http } from 'viem'
import { mainnet, base } from 'viem/chains'
import { createConfig, WagmiProvider, useWalletClient } from 'wagmi'
import { DynamicContextProvider, useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector'
import {
  initializeClient,
  openHallidayPayments,
  openWithdraw,
  openActivity,
} from '@halliday-sdk/payments'
import { connectWalletClient } from '@halliday-sdk/payments/viem'

const HALLIDAY_API_KEY = import.meta.env.VITE_HALLIDAY_API_KEY

if (!HALLIDAY_API_KEY) {
  alert('HALLIDAY_API_KEY is missing!')
}

const tokens = [
  'base:0x',
  'base:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
]

const wagmiConfig = createConfig({
  chains: [mainnet, base],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http('https://cloudflare-eth.com'),
    [base.id]: http('https://mainnet.base.org'),
  },
})

initializeClient({
  apiKey: HALLIDAY_API_KEY,
  outputs: tokens,
  onReady: () => console.log('Halliday preloaded and ready'),
  onError: (error) => console.error('Halliday init error:', error),
})

function HallidayActions() {
  const { primaryWallet, setShowAuthFlow, handleLogOut } = useDynamicContext()
  const { data: walletClient } = useWalletClient()

  const enabled = !!primaryWallet && !!walletClient
  const userWallet = walletClient ? connectWalletClient(() => walletClient) : null

  const onConnect = () => {
    if (primaryWallet) handleLogOut()
    else setShowAuthFlow(true)
  }

  const onDeposit = () =>
    openHallidayPayments({
      userWallet,
      destinationAddress: primaryWallet.address
    })

  const onWithdraw = () =>
    openWithdraw({
      withdrawInputs: tokens,
      withdrawFunder: userWallet,
      // withdrawDestinationAddress: '0x...', // User can set this too
    })

  // Note openActivity cannot be properly called until a userWallet, funder or 
  // owner is provided to initializeClient or openHallidayPayments

  return (
    <div className="halliday-container">
      <h1>Halliday SDK Dynamic Wagmi Example</h1>
      <button onClick={onConnect}>
        {primaryWallet ? 'Disconnect' : 'Connect'}
      </button>
      <button disabled={!enabled} onClick={onDeposit}>Deposit with Halliday</button>
      <button disabled={!enabled} onClick={onWithdraw}>Withdraw</button>
      <button disabled={!enabled} onClick={openActivity}>Activity</button>
    </div>
  )
}

export default function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <DynamicWagmiConnector>
          <HallidayActions />
        </DynamicWagmiConnector>
      </WagmiProvider>
    </DynamicContextProvider>
  )
}

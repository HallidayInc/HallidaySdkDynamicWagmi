import { useEffect } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { useHallidayPayments } from '@halliday-sdk/payments/react'
import { connectWalletClient } from '@halliday-sdk/payments/viem'

function HallidayEventLogger() {
  const { instance } = useHallidayPayments()

  useEffect(() => {
    const offStatus = instance.on('status', (s) => console.log(`status: ${s.type}`))
    const offError = instance.on('error', (e) => console.log(`error (${e.source}): ${e.message}`))
    const offClose = instance.on('close', () => console.log('widget closed'))

    return () => {
      offStatus()
      offError()
      offClose()
    }
  }, [instance])

  return null
}

export default function App() {
  const { primaryWallet, setShowAuthFlow, handleLogOut } = useDynamicContext()
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { openDeposit, openWithdrawal, openActivity, updateWallets, isReady } =
    useHallidayPayments()

  const enabled = primaryWallet && isConnected && walletClient && isReady

  const connect = () => {
    if (primaryWallet) handleLogOut()
    else setShowAuthFlow(true)
  }

  useEffect(() => {
    if (!enabled) return
    const owner = connectWalletClient(() => walletClient)

    updateWallets({
      owner,
      deposit: { funders: [owner], destinationAddress: address },
      withdrawal: { funder: owner },
    })
  }, [enabled, walletClient, address])

  return (
    <div className="halliday-container">
      <HallidayEventLogger />
      <h1>Halliday SDK Dynamic Wagmi Example</h1>
      <button onClick={connect}>{address ? 'Disconnect' : 'Connect wallet'}</button>
      <button disabled={!enabled} onClick={openDeposit}>
        Deposit with Halliday
      </button>
      <button disabled={!enabled} onClick={openWithdrawal}>
        Withdraw
      </button>
      <button disabled={!enabled} onClick={openActivity}>
        Activity
      </button>
    </div>
  )
}

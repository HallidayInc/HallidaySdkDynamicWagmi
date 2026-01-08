import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core'
import { useAccount, useWalletClient } from 'wagmi'
import { openHallidayPayments } from '@halliday-sdk/payments'
import { connectWalletClient } from '@halliday-sdk/payments/viem'
import './App.css'

const HALLIDAY_PUBLIC_API_KEY = import.meta.env.VITE_HALLIDAY_API_KEY

function App() {
  const { sdkHasLoaded, setShowAuthFlow, handleLogOut } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { address, isConnected } = useAccount();
  const { data: walletClient, isSuccess } = useWalletClient();

  const launchHalliday = async () => {
    if (!isConnected || !address) return;

    let connectedWalletClient;
    if (walletClient && isSuccess) {
      // Remember to add Base in the Dynamic dashboard beforehand (see README)
      connectedWalletClient = connectWalletClient(() => walletClient);
    } else {
      // Using window.ethereum EIP-1193 wallet like MetaMask via Dynamic
      connectedWalletClient = window.ethereum;
    }

    openHallidayPayments({
      apiKey: HALLIDAY_PUBLIC_API_KEY,
      outputs: ['base:0x', 'base:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'],
      windowType: 'MODAL',
      owner: { address, ...connectedWalletClient },
      funder: { address, ...connectedWalletClient }
    }).catch(e => console.error('Halliday error:', e.issues));
  };

  if (!sdkHasLoaded) {
    return <p>Loading...</p>
  }

  if (!isLoggedIn) {
    return (
      <button onClick={() => setShowAuthFlow(true)}>
        Sign in
      </button>
    )
  }

  return (
    <div>
      <button onClick={handleLogOut}>Log out</button>
      <p>Wallet: {address}</p>
      <button onClick={launchHalliday}>Open Halliday</button>
    </div>
  );
}

export default App

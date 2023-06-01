'use client';

import ReactAlertSample from '@/components/ReactAlertSample';
import { useWalletContext } from '@/context/wallet';
import { useGlobalState } from '@/store';
import { useHookstate } from '@hookstate/core';
import { ConnectKitButton } from 'connectkit';
import { BigNumber } from 'ethers';
import { useEffect } from 'react';

export default function Home() {
  const gState = useGlobalState();
  const { alert, status, address, Disconnect, isDisconnected, ctxContract } =
    useWalletContext();
  const balance = useHookstate(0);
  const recipient = useHookstate('');
  const amount = useHookstate(0);

  const getBusdBal = async () => {
    try {
      const data = await ctxContract.busd.balanceOf(
        address ?? '0x7893fb78A1273651105cF91d176C11a4186F137c'
      );
      console.log('TEST: ', data);

      const bal = await toBUSD(data.toString());
      balance.set(bal);
      alert.success(`Balance: ${bal}`);
    } catch (e) {
      console.error(e);
    }
  };

  const sendBusd = async () => {
    try {
      const _amount = await toRawBUSD(amount.value);
      console.log('TEST: ', _amount);
      const data = await ctxContract.busd.transfer(recipient.value, _amount);

      alert.success('SENT SUCCESS');
    } catch (error) {
      alert.error(error.message);
      console.error(error.message);
    } finally {
      getBusdBal();
    }
  };

  const toBUSD = async (price) => {
    const usdtDecimal = await ctxContract.busd.decimals();
    return Number(price) / 10 ** Number(usdtDecimal);
  };

  const toRawBUSD = async (price) => {
    const usdtDecimal = await ctxContract.busd.decimals();
    // return Number(price) * 10 ** Number(usdtDecimal);
    return BigNumber.from(price).mul(BigNumber.from(10).pow(usdtDecimal));
  };

  useEffect(() => {
    if (isDisconnected) {
      balance.set(0);
    }
  }, [isDisconnected]);

  return (
    <main className="bg-gray-200">
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold text-red-500">
          Next-Tailwind Starter Template
        </h1>

        <ReactAlertSample />

        {/* sample */}
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="flex items-center gap-4">
            <ConnectKitButton />
            <ConnectKitButton.Custom>
              {({ show, isConnected, truncatedAddress }) => {
                return (
                  <button
                    onClick={show}
                    className="rounded-lg bg-green-500 px-6 py-2 text-white hover:bg-green-600 active:scale-95"
                  >
                    {isConnected ? truncatedAddress : 'Custom Connect'}
                  </button>
                );
              }}
            </ConnectKitButton.Custom>
            {gState['verify'].value && (
              <button
                onClick={() => Disconnect()}
                className="rounded-lg bg-red-500 px-6 py-2 text-white hover:bg-red-600 active:scale-95"
              >
                Disconnect
              </button>
            )}
          </div>

          <div className="text-center">
            <div>Status:</div>
            <div className="text-red-500">{status}</div>
            {address && <div>{address}</div>}
          </div>

          <div className="flex flex-col items-center">
            <button
              onClick={getBusdBal}
              className="rounded-lg bg-green-500 px-6 py-2 text-white hover:bg-green-600 active:scale-95"
            >
              GET BUSD BALANCE
            </button>
            <div>{`BUSD Balance: ${balance.value.toLocaleString()}`}</div>
          </div>

          {gState['verify'].value && (
            <div className="space-y-8 pt-6">
              <div className="flex flex-col items-center gap-2">
                <input
                  className="border px-4 py-1"
                  type="text"
                  value={recipient.value}
                  onChange={(e) => recipient.set(e.target.value)}
                  placeholder="Recipient Address"
                />
                <input
                  className="border px-4 py-1"
                  type="number"
                  value={amount.value}
                  onChange={(e) => amount.set(Number(e.target.value))}
                  placeholder="Amount"
                />
                <button
                  onClick={sendBusd}
                  className="rounded-lg bg-green-500 px-6 py-2 text-white hover:bg-green-600 active:scale-95"
                >
                  SEND
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

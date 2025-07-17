import { ApiPromise, WsProvider } from '@polkadot/api';
import presignedTxs from './presigned.json'


const wsProvider = new WsProvider("wss://moonbeam.unitedbloc.com");
const api = await ApiPromise.create({
    provider: wsProvider,
    noInitWarn: true,
});

async function sendRawTransaction(encodedExtrinsic) {
    try{
        const decodedExt = api.tx(encodedExtrinsic);
        await api.rpc.author.submitExtrinsic(encodedExtrinsic);
    } catch (error) {
        console.error("Error sending transaction:", error);
    }

}

async function processNestedPresignedTxs(nestedList) {
    const xcmTxsToSend = [];
    const cleanupTxsToSend = [];
  
    for (const item of nestedList) {
      if (item.presigned_txs && Array.isArray(item.presigned_txs)) {
        const presignedTxs = item.presigned_txs;
  
        for (const txObject of presignedTxs) {
          // Check for the main moonbeamToPendulumXcm transaction
          if (txObject.phase === "moonbeamToPendulumXcm" && txObject.network === "moonbeam") {
            xcmTxsToSend.push({
              name: `moonbeamToPendulumXcm (main, nonce: ${txObject.nonce})`,
              txData: txObject.txData
            });
  
            // Check for additional moonbeamToPendulumXcm transactions in meta (backups)
            if (txObject.meta && txObject.meta.additionalTxs) {
              for (const [key, additionalTx] of Object.entries(txObject.meta.additionalTxs)) {
                if (additionalTx.phase === "moonbeamToPendulumXcm" && additionalTx.network === "moonbeam") {
                  xcmTxsToSend.push({
                    name: `${key} (nonce: ${additionalTx.nonce})`,
                    txData: additionalTx.txData
                  });
                }
              }
            }
          } else {
            // Also check additionalTxs in other phases in case moonbeamToPendulumXcm txs are nested there
            if (txObject.meta && txObject.meta.additionalTxs) {
              for (const [key, additionalTx] of Object.entries(txObject.meta.additionalTxs)) {
                if (additionalTx.phase === "moonbeamToPendulumXcm" && additionalTx.network === "moonbeam") {
                  xcmTxsToSend.push({
                    name: `${key} (nonce: ${additionalTx.nonce})`,
                    txData: additionalTx.txData
                  });
                }
              }
            }
          }
          
          // Check for the main moonbeamCleanup transaction
          if (txObject.phase === "moonbeamCleanup" && txObject.network === "moonbeam") {
            cleanupTxsToSend.push({
              name: `moonbeamCleanup (main, nonce: ${txObject.nonce})`,
              txData: txObject.txData
            });
  
            // Check for additional moonbeamCleanup transactions in meta
            if (txObject.meta && txObject.meta.additionalTxs) {
              for (const [key, additionalTx] of Object.entries(txObject.meta.additionalTxs)) {
                if (additionalTx.phase === "moonbeamCleanup" && additionalTx.network === "moonbeam") {
                  cleanupTxsToSend.push({
                    name: `${key} (nonce: ${additionalTx.nonce})`,
                    txData: additionalTx.txData
                  });
                }
              }
            }
          } else {
            // Also check additionalTxs in other phases in case moonbeamCleanup txs are nested there
            if (txObject.meta && txObject.meta.additionalTxs) {
              for (const [key, additionalTx] of Object.entries(txObject.meta.additionalTxs)) {
                if (additionalTx.phase === "moonbeamCleanup" && additionalTx.network === "moonbeam") {
                  cleanupTxsToSend.push({
                    name: `${key} (nonce: ${additionalTx.nonce})`,
                    txData: additionalTx.txData
                  });
                }
              }
            }
          }
        }
      }
    }
  
    // First, send the XCM transactions
    if (xcmTxsToSend.length > 0) {
      console.log(`Found ${xcmTxsToSend.length} Moonbeam to Pendulum XCM transactions to send.`);
      for (const txInfo of xcmTxsToSend) {
        console.log(`Sending transaction: ${txInfo.name}`);
        console.log(`Transaction Data: ${txInfo.txData}`);
        await sendRawTransaction(txInfo.txData);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } else {
      console.log("No Moonbeam to Pendulum XCM transactions found in the provided object.");
    }
    
    // Then, send the cleanup transactions
    if (cleanupTxsToSend.length > 0) {
      console.log(`Found ${cleanupTxsToSend.length} Moonbeam cleanup transactions to send.`);
      for (const txInfo of cleanupTxsToSend) {
        console.log(`Sending transaction: ${txInfo.name}`);
        console.log(`Transaction Data: ${txInfo.txData}`);
        await sendRawTransaction(txInfo.txData);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } else {
      console.log("No Moonbeam cleanup transactions found in the provided object.");
    }
  }
  
  // Run the process
  processNestedPresignedTxs(presignedTxs);

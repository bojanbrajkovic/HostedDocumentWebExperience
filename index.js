async function getShortCode() {
  const response = await fetch('https://api.workflow.prod.trulioo.com/interpreter-v2/flow/66716e402bfde900dccdd90e');
  if (!response.ok) {
    throw new Error('Network response was not ok ' + response.statusText);
  }
  const data = await response.json();
  return data.shortCode;
}

import truliooDocV from 'https://cdn.jsdelivr.net/npm/@trulioo/docv@latest/+esm';
const { Trulioo, event } = truliooDocV;

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const shortCode = await getShortCode();

    if (!shortCode) {
      console.error("Short code is not defined. Please provide a valid short code.");
      return;
    }

    const elementID = "trulioo-sdk"; // The HTML element id to attach to

    // Set up the workflow configuration
    const workflowOption = Trulioo.workflow().setShortCode(shortCode);

    // Set up callbacks to get results and debugging errors
    const callbacks = new event.adapters.ListenerCallback({
      onComplete: (success) => {
        console.info(`Verification Successful: ${success.transactionId}`);
      },
      onError: (error) => {
        console.error(`Verification Failed with Error Code: ${error.code}, TransactionID: ${error.transactionId}, Reason: ${error.message}`);
      },
      onException: (exception) => {
        console.error("Verification Failed with Exception:", exception);
      }
    });

    const callbackOption = Trulioo.event().setCallbacks(callbacks);

    // Initialize the SDK with the workflow configuration
    Trulioo.initialize(workflowOption)
      .then(complete => {
        console.info("Initialize complete:", complete);
        // Launch the UI with the provided HTML element ID
        Trulioo.launch(elementID, callbackOption)
          .then(success => {
            console.info("Launch success:", success);
          })
          .catch(launchError => {
            console.error("Error during launch:", launchError);
          });
      })
      .catch(initError => {
        console.error("Error during initialization:", initError);
      });
  } catch (error) {
    console.error("Error fetching short code:", error);
  }
});

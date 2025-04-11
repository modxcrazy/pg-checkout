import { db, ref, get, child, onValue } from './firebase-config.js';

import { db, ref, get } from './firebase-config.js';

async function fetchUPI(appName) {
  const snapshot = await get(ref(db, 'upi_ids/' + appName));
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    console.error("UPI ID not found for", appName);
    return null;
  }
}

const qrCode = document.getElementById('qrCode');
const timerElement = document.getElementById('timer');
const payButton = document.getElementById('payButton');

let transactionId = "txn_123";
let countdown = 900;

function updateTimer() {
  const min = Math.floor(countdown / 60);
  const sec = countdown % 60;
  timerElement.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
  if (countdown > 0) {
    countdown--;
    setTimeout(updateTimer, 1000);
  }
}

function loadDynamicUPI() {
  const dbRef = ref(db);
  get(child(dbRef, `payments/${transactionId}`)).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const upiLink = `upi://pay?pa=${data.upi}&pn=Papaya%20Coders&am=${data.amount}&cu=INR`;
      qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLink)}`;

      // Auto refresh QR every 15s
      setInterval(() => {
        qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLink)}&t=${Date.now()}`;
      }, 15000);
    }
  });
}

function listenForPayment() {
  const txnRef = ref(db, `payments/${transactionId}/status`);
  onValue(txnRef, (snapshot) => {
    if (snapshot.val() === "success") {
      document.querySelector(".payment-box").innerHTML = `
        <h2>Payment Successful!</h2>
        <img src="https://cdn-icons-png.flaticon.com/512/845/845646.png" style="width: 100px; margin: 20px 0;" />
        <p>Thank you for your payment.</p>
      `;
    }
  });
}

payButton.addEventListener('click', () => {
  const selectedApp = document.querySelector('input[name="upiApp"]:checked').value;
  let packageName = "";

  switch (selectedApp) {
    case "phonepe": packageName = "com.phonepe.app"; break;
    case "gpay": packageName = "com.google.android.apps.nbu.paisa.user"; break;
    case "paytm": packageName = "net.one97.paytm"; break;
  }

  get(child(ref(db), `payments/${transactionId}`)).then(snapshot => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const upiLink = `upi://pay?pa=${data.upi}&pn=Papaya%20Coders&am=${data.amount}&cu=INR`;
      window.location.href = `intent://${upiLink}#Intent;scheme=upi;package=${packageName};end`;
    }
  });
});

updateTimer();
loadDynamicUPI();
listenForPayment();

// Firebase config
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push
} from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

// Your Firebase config (replace with yours)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://pg-data-ed1c2-default-rtdb.firebaseio.com",
  projectId: "pg-data-ed1c2",
  storageBucket: "pg-data-ed1c2.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elements
const qrImage = document.getElementById("qrImage");
const qrLoader = document.getElementById("qrLoader");
const upiDisplay = document.getElementById("upiDisplay");
const amtDisplay = document.getElementById("amtDisplay");
const timer = document.getElementById("timer");
const payBtn = document.getElementById("payBtn");
const utrInput = document.getElementById("utr");
const successAnimation = document.getElementById("successAnimation");

// 1. Load UPI details from Firebase
let upiId = "";
let amount = 0;

onValue(ref(db, "settings"), (snapshot) => {
  const data = snapshot.val();
  if (data) {
    upiId = data.upi;
    amount = data.amount;
    upiDisplay.textContent = upiId;
    amtDisplay.textContent = `₹${amount}`;

    // Generate QR
    const qrData = `upi://pay?pa=${upiId}&pn=User&am=${amount}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=200x200`;

    qrImage.src = qrUrl;
    qrImage.onload = () => {
      qrLoader.style.display = "none";
      qrImage.style.display = "block";
    };
  }
});

// 2. Countdown Timer (15 mins)
let timeLeft = 15 * 60;
const updateTimer = () => {
  const min = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const sec = String(timeLeft % 60).padStart(2, '0');
  timer.textContent = `${min}:${sec}`;
  if (timeLeft > 0) timeLeft--;
};
setInterval(updateTimer, 1000);

// 3. On Click - Submit UTR
payBtn.addEventListener("click", () => {
  const utr = utrInput.value.trim();
  const selectedApp = document.querySelector('input[name="upiApp"]:checked')?.value;

  if (!utr || !selectedApp) {
    alert("Please enter UTR and select a UPI App.");
    return;
  }

  const txn = {
    utr,
    app: selectedApp,
    amount,
    upi: upiId,
    status: "Pending",
    date: new Date().toLocaleString()
  };

  push(ref(db, "transactions"), txn)
    .then(() => {
      successAnimation.style.display = "block";
      setTimeout(() => location.reload(), 3000);
    })
    .catch((err) => {
      alert("Error saving transaction.");
      console.error(err);
    });
});

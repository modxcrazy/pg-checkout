import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, push, get, child } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCn553qWsVz2VF1dZ4Ji5OkQDGFvMORbJE",
  authDomain: "pg-data-ed1c2.firebaseapp.com",
  databaseURL: "https://pg-data-ed1c2-default-rtdb.firebaseio.com",
  projectId: "pg-data-ed1c2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const qrImage = document.getElementById("qrImage");
const timerText = document.getElementById("timer");
const payBtn = document.getElementById("payBtn");
const successBox = document.getElementById("successAnimation");

let minutes = 15;
let seconds = 0;
let dynamicUpi = "";
let dynamicAmount = "";

// Load UPI ID & amount from Firebase
async function loadUPIData() {
  const snapshot = await get(child(ref(db), "paymentSettings"));
  if (snapshot.exists()) {
    dynamicUpi = snapshot.val().upiId;
    dynamicAmount = snapshot.val().amount;
    loadQR(dynamicUpi, dynamicAmount);
  } else {
    alert("Failed to load UPI settings.");
  }
}

function loadQR(upi, amount) {
  const encoded = encodeURIComponent(`upi://pay?pa=${upi}&am=${amount}&cu=INR`);
  qrImage.src = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encoded}`;
}

function startTimer() {
  setInterval(() => {
    if (minutes === 0 && seconds === 0) return;
    if (seconds === 0) {
      minutes--;
      seconds = 59;
    } else {
      seconds--;
    }
    timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, 1000);
}

payBtn.addEventListener("click", () => {
  const utr = document.getElementById("utrNumber").value.trim();
  if (!utr || utr.length < 5) {
    alert("Please enter a valid UTR number.");
    return;
  }

  const app = document.querySelector('input[name="upiApp"]:checked').value;

  const data = {
    utr: utr,
    status: "pending",
    date: new Date().toISOString().split("T")[0],
    app: app,
    amount: dynamicAmount,
    upiId: dynamicUpi
  };

  push(ref(db, "transactions"), data).then(() => {
    successBox.style.display = "block";
    setTimeout(() => successBox.style.display = "none", 3000);
  });
});

// INIT
loadUPIData();
startTimer();

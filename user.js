
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCn553qWsVz2VF1dZ4Ji5OkQDGFvMORbJE",
  authDomain: "pg-data-ed1c2.firebaseapp.com",
  databaseURL: "https://pg-data-ed1c2-default-rtdb.firebaseio.com",
  projectId: "pg-data-ed1c2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let selectedApp = "";
let timeLeft = 15 * 60;
let timerInterval = null;

// -------------------- Load UPI ID + Amount --------------------
get(ref(db, "settings")).then(snapshot => {
  if (snapshot.exists()) {
    const { upi, amount } = snapshot.val();

    document.getElementById("upiDisplay").textContent = upi;
    document.getElementById("amtDisplay").textContent = "₹" + amount;

    generateQR(upi, amount);
    startTimer();
  }
});

// -------------------- Generate UPI QR --------------------
function generateQR(upi, amount) {
  const qrURL = `upi://pay?pa=${upi}&pn=In99Soft&am=${amount}&cu=INR`;
  const encodedURL = encodeURIComponent(qrURL);
  const qrImgURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedURL}`;

  const qrImage = document.getElementById("qrImage");
  const qrLoader = document.getElementById("qrLoader");
  qrLoader.style.display = "block";
  qrImage.style.display = "none";

  const img = new Image();
  img.onload = () => {
    qrImage.src = qrImgURL;
    qrLoader.style.display = "none";
    qrImage.style.display = "block";
  };
  img.src = qrImgURL;
}

// -------------------- Start Countdown --------------------
function startTimer() {
  timerInterval = setInterval(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.getElementById("timer").textContent = \`\${mins}:\${secs < 10 ? '0' : ''}\${secs}\`;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timerInterval);
      document.getElementById("timer").textContent = "Expired";
    }
  }, 1000);
}

// -------------------- UPI App Selection with Glow --------------------
document.querySelectorAll(".upi-option").forEach(option => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".upi-option").forEach(opt => opt.classList.remove("selected"));
    option.classList.add("selected");
    option.querySelector("input[type='radio']").checked = true;
    selectedApp = option.querySelector("input[type='radio']").value;
  });
});

// -------------------- Handle Payment --------------------
document.getElementById("payBtn").addEventListener("click", () => {
  const utr = document.getElementById("utr").value.trim();
  if (!selectedApp) return alert("Please select a UPI App!");
  if (!utr || utr.length < 6) return alert("Enter a valid UTR number!");

  const amount = document.getElementById("amtDisplay").textContent.replace("₹", "");
  const upi = document.getElementById("upiDisplay").textContent;
  const date = new Date().toISOString().split("T")[0];
  const txnId = Date.now();

  set(ref(db, "transactions/" + txnId), {
    utr: utr,
    status: "pending",
    amount: amount,
    upi: upi,
    app: selectedApp,
    date: date
  }).then(() => {
    showSuccessAnimation();
    document.getElementById("utr").value = "";
    document.querySelectorAll(".upi-option").forEach(opt => opt.classList.remove("selected"));
    document.querySelectorAll("input[name='upiApp']").forEach(r => r.checked = false);
    selectedApp = "";
  });
});

// -------------------- Success Animation --------------------
function showSuccessAnimation() {
  const successBox = document.getElementById("successAnimation");
  successBox.style.display = "block";
  playSuccessSound();
  setTimeout(() => {
    successBox.style.display = "none";
    location.reload(); // auto refresh
  }, 4000);
}

// -------------------- Success Sound --------------------
function playSuccessSound() {
  const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3");
  audio.play().catch(err => console.warn("Audio playback failed:", err));
}

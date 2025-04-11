import { db, ref, set, get } from './firebase-config.js';

// Save transaction to Firebase
function saveTransaction(data) {
  const txnRef = ref(db, `transactions/${data.id}`);
  set(txnRef, data);
}

// Simulate verification (for demo — replace with real logic if needed)
function simulateVerify(txnId) {
  const txnRef = ref(db, `transactions/${txnId}`);

  setTimeout(async () => {
    const snapshot = await get(txnRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      data.status = "success";
      set(txnRef, data);

      // Trigger effects
      showSuccessAnimation();
      playSuccessSound();
      triggerVibration();
      document.getElementById("status").innerText = "Payment Successful!";
    }
  }, 4000); // simulate 4s processing
}

// Payment success animation
function showSuccessAnimation() {
  const msg = document.createElement("div");
  msg.innerText = "✓ Payment Successful";
  msg.style.position = "fixed";
  msg.style.top = "50%";
  msg.style.left = "50%";
  msg.style.transform = "translate(-50%, -50%)";
  msg.style.padding = "20px 40px";
  msg.style.background = "#00e676";
  msg.style.color = "#000";
  msg.style.fontSize = "24px";
  msg.style.fontWeight = "bold";
  msg.style.borderRadius = "10px";
  msg.style.boxShadow = "0 0 30px #00e676";
  msg.style.zIndex = "9999";

  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

// Sound on success
function playSuccessSound() {
  const audio = new Audio("https://www.soundjay.com/buttons/sounds/button-4.mp3");
  audio.play();
}

// Vibration (if supported)
function triggerVibration() {
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
}

// Export functions
window.saveTransaction = saveTransaction;
window.simulateVerify = simulateVerify;

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCn553qWsVz2VF1dZ4Ji5OkQDGFvMORbJE",
  authDomain: "pg-data-ed1c2.firebaseapp.com",
  databaseURL: "https://pg-data-ed1c2-default-rtdb.firebaseio.com",
  projectId: "pg-data-ed1c2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// At the top of admin.js
const auth = getAuth();
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html"; // Redirect if not logged in
  }
});

// -------- LogOut Button --------
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "admin-login.html";
  });
});

// -------- Save UPI Settings --------
document.getElementById("saveUpiBtn").addEventListener("click", () => {
  const upi = document.getElementById("adminUpi").value.trim();
  const amount = document.getElementById("adminAmount").value.trim();

  if (!upi || !amount) return alert("Please enter UPI ID and Amount");

  set(ref(db, "settings"), {
    upi: upi,
    amount: amount
  }).then(() => {
    alert("UPI Settings Updated");
  });
});

// -------- Load Transactions --------
function loadTransactions() {
  const txnList = document.getElementById("txnList");
  txnList.innerHTML = "";

  get(ref(db, "transactions")).then(snapshot => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const keys = Object.keys(data).reverse();

      keys.forEach(id => {
        const txn = data[id];

        const row = document.createElement("div");
        row.className = "transaction-row";

        row.innerHTML = `
          <div>${txn.utr}</div>
          <div>₹${txn.amount}</div>
          <div>${txn.app}</div>
          <div>${txn.status}</div>
          <div>${txn.date}</div>
          <div class="txn-btns">
            <button class="reject-btn" onclick="updateStatus('${id}', 'rejected')">Reject</button>
            <button class="approve-btn" onclick="updateStatus('${id}', 'approved')">Approve</button>
          </div>
        `;

        txnList.appendChild(row);
      });
    }
  });
}

// -------- Update Status --------
window.updateStatus = (id, status) => {
  update(ref(db, "transactions/" + id), {
    status: status
  }).then(() => {
    if (status === "approved") {
      showToast("Approved successfully!");
    } else {
      alert("Transaction Rejected");
    }
    loadTransactions();
  });
};

// -------- Show Toast --------
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 3000);
}

// -------- Initial Load --------
loadTransactions();

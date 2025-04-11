import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set, update, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCn553qWsVz2VF1dZ4Ji5OkQDGFvMORbJE",
  authDomain: "pg-data-ed1c2.firebaseapp.com",
  databaseURL: "https://pg-data-ed1c2-default-rtdb.firebaseio.com",
  projectId: "pg-data-ed1c2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

onAuthStateChanged(auth, user => {
  if (!user) window.location.href = "login.html";
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "admin-login.html");
});

document.getElementById("saveUpiBtn").addEventListener("click", () => {
  const upi = document.getElementById("adminUpi").value.trim();
  const amount = document.getElementById("adminAmount").value.trim();
  if (!upi || !amount) return alert("Please enter UPI ID and Amount");

  set(ref(db, "settings"), { upi, amount }).then(() => showToast("Settings updated!"));
});

// Live Transactions Array
const transactions = [];

// Firebase Live Listener for Transactions
const transactionsRef = ref(db, "transactions");
onValue(transactionsRef, snapshot => {
  const data = snapshot.val();
  if (!data) return;

  transactions.length = 0; // Clear previous entries
  Object.keys(data).forEach(key => {
    transactions.push({ id: key, ...data[key] });
  });

  renderTransactions();
  showToast("Transactions updated!");
});

// Render Transactions into Table
function renderTransactions() {
  const tbody = document.getElementById("transactionBody");
  tbody.innerHTML = "";
  transactions.forEach(txn => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${txn.utr}</td>
      <td>₹${txn.amount}</td>
      <td>${txn.app || 'N/A'}</td>
      <td>${txn.date}</td>
      <td>${txn.status}</td>
      <td>
        <button class="approve-btn" onclick="updateStatus('${txn.id}', 'Approved')">Approve</button>
        <button class="reject-btn" onclick="updateStatus('${txn.id}', 'Rejected')">Reject</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  updateChart();
}

// Update Status in Firebase
window.updateStatus = (id, status) => {
  update(ref(db, "transactions/" + id), { status })
    .then(() => {
      showToast(`${status} successfully!`);
    });
};

// Update Chart
function updateChart() {
  const counts = transactions.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const ctx = document.getElementById("statusChart").getContext("2d");
  if (window.statusChart) window.statusChart.destroy();

  window.statusChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Approved', 'Rejected', 'Pending'],
      datasets: [{
        data: [counts['Approved'] || 0, counts['Rejected'] || 0, counts['Pending'] || 0],
        backgroundColor: ['#28a745', '#e74c3c', '#ffc107']
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      responsive: true
    }
  });
}

// Show Toast
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerHTML = `<span class="tick">✔</span> ${msg}`;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 3000);
}

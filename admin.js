import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { signOut, getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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

const transactions = [
  { utr: "UTR001", amount: 1000, app: "GPay", date: "2025-04-11", status: "Pending" },
  { utr: "UTR002", amount: 1500, app: "PhonePe", date: "2025-04-10", status: "Pending" }
];

function renderTransactions() {
  const tbody = document.getElementById("transactionBody");
  tbody.innerHTML = "";
  transactions.forEach((txn, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${txn.utr}</td>
      <td>₹${txn.amount}</td>
      <td>${txn.app}</td>
      <td>${txn.date}</td>
      <td>${txn.status}</td>
      <td>
        <button class="approve-btn" onclick="updateStatus(${index}, 'Approved')">Approve</button>
        <button class="reject-btn" onclick="updateStatus(${index}, 'Rejected')">Reject</button>
      </td>
    `;
    tbody.appendChild(row);
  });
  updateChart();
}

window.updateStatus = (index, status) => {
  transactions[index].status = status;
  renderTransactions();
  showToast(status === "Approved" ? "Approved successfully!" : "Transaction Rejected");
};

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

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerHTML = `<span class="tick">✔</span> ${msg}`;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 3000);
}

document.addEventListener("DOMContentLoaded", renderTransactions);

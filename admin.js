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
const transactions = [
  { utr: 'UTR001', amount: 1000, date: '2025-04-11', status: 'Pending' },
  { utr: 'UTR002', amount: 1500, date: '2025-04-10', status: 'Pending' },
  // Add more transactions as needed
];

function renderTransactions() {
  const tbody = document.getElementById('transactionBody');
  tbody.innerHTML = '';
  transactions.forEach((txn, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${txn.utr}</td>
      <td>₹${txn.amount}</td>
      <td>₹${txn.app}</td>
      <td>${txn.date}</td>
      <td>${txn.status}</td>
      <td>
        <button class="action-btn approve-btn" onclick="updateStatus(${index}, 'Approved')">Approve</button>
        <button class="action-btn reject-btn" onclick="updateStatus(${index}, 'Rejected')">Reject</button>
      </td>
    `;
    tbody.appendChild(row);
  });
  updateChart();
}

function updateStatus(index, status) {
  transactions[index].status = status;
  renderTransactions();
}

document.addEventListener('DOMContentLoaded', renderTransactions);

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

let statusChart;

function updateChart() {
  const statusCounts = transactions.reduce((counts, txn) => {
    counts[txn.status] = (counts[txn.status] || 0) + 1;
    return counts;
  }, {});

  const data = {
    labels: ['Approved', 'Rejected', 'Pending'],
    datasets: [{
      label: 'Transaction Status',
      data: [
        statusCounts['Approved'] || 0,
        statusCounts['Rejected'] || 0,
        statusCounts['Pending'] || 0
      ],
      backgroundColor: ['#28a745', '#dc3545', '#ffc107']
    }]
  };

  const config = {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  };

  if (statusChart) {
    statusChart.destroy();
  }
  const ctx = document.getElementById('statusChart').getContext('2d');
  statusChart = new Chart(ctx, config);
}

// -------- Show Toast --------
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 3000);
}

// -------- Initial Load --------
loadTransactions();

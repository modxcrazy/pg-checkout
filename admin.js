import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCn553qWsVz2VF1dZ4Ji5OkQDGFvMORbJE",
  authDomain: "pg-data-ed1c2.firebaseapp.com",
  databaseURL: "https://pg-data-ed1c2-default-rtdb.firebaseio.com",
  projectId: "pg-data-ed1c2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let chartInstance;

function loadTransactions() {
  get(ref(db, "transactions")).then(snapshot => {
    const data = snapshot.val();
    const container = document.getElementById("txnList");
    container.innerHTML = "";

    let approved = 0, pending = 0;
    const filter = document.getElementById("filterDate").value;

    for (const key in data) {
  const txn = data[key];
  const matchDate = !filter || txn.date === filter;

  if (matchDate) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <span>${txn.utr}</span>
      <span>${txn.amount}</span>
      <button onclick='approveTransaction("${key}")'>Approve</button>
      <button onclick='showDialog(${JSON.stringify(txn)})'>View</button>
    `;
    container.appendChild(div);
  }

  if (txn.status === "approved") approved++;
  if (txn.status === "pending") pending++;
}

    showChart(approved, pending);

    document.querySelectorAll("button[data-id]").forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-id");
        update(ref(db, "transactions/" + id), { status: "approved" });
        showToast("Approved successfully!");
        loadTransactions();
      };
    });
  });
}

function showChart(approved, pending) {
  const ctx = document.getElementById("txnChart").getContext("2d");
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Approved", "Pending"],
      datasets: [{
        label: "Transactions",
        data: [approved, pending],
        backgroundColor: ["green", "orange"]
      }]
    }
  });
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerHTML = `<span class="tick">✔</span> ${msg}`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

document.getElementById("filterDate").addEventListener("change", loadTransactions);
loadTransactions();

// Function to approve a transaction
function approveTransaction(txnId) {
  const txnRef = ref(db, "transactions/" + txnId);
  set(txnRef, {
    ...data[txnId],
    status: "approved"  // Mark as approved
  }).then(() => {
    alert("Transaction approved successfully!");
    location.reload(); // Refresh the page to reflect the updated status
  }).catch(error => {
    alert("Error: " + error.message);
  });
}

// Function to show transaction details in a dialog
function showDialog(txn) {
  document.getElementById("dUtr").textContent = txn.utr;
  document.getElementById("dAmount").textContent = txn.amount;
  document.getElementById("dApp").textContent = txn.app || 'N/A';
  document.getElementById("dStatus").textContent = txn.status;
  document.getElementById("dDate").textContent = txn.date;
  document.getElementById("txnDialog").style.display = "block";
}

// Function to close the dialog
function closeDialog() {
  document.getElementById("txnDialog").style.display = "none";
}

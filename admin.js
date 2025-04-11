import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, get, update, set } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCn553qWsVz2VF1dZ4Ji5OkQDGFvMORbJE",
  authDomain: "pg-data-ed1c2.firebaseapp.com",
  databaseURL: "https://pg-data-ed1c2-default-rtdb.firebaseio.com",
  projectId: "pg-data-ed1c2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let chartInstance;

// ------------------------ Load Transactions + Chart -------------------------
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
      <p><strong>UTR:</strong> ${txn.utr}</p>
      <p><strong>Status:</strong> ${txn.status === "approved" ? "<span style='color:green;'>Approved</span>" : "<span style='color:orange;'>Pending</span>"}</p>
      <p><strong>Amount:</strong> ₹${txn.amount}</p>
      <p><strong>App:</strong> ${txn.app}</p>
      <p><strong>Date:</strong> ${txn.date}</p>
      ${txn.status !== "approved" ? `<button data-id="${key}">Approve</button>` : ""}
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
        showToast("Transaction Approved!");
        loadTransactions();
      };
    });
  });
}

// ------------------------ Dynamic UPI ID + Amount Save ----------------------
document.getElementById("saveUpiBtn").addEventListener("click", () => {
  const upiId = document.getElementById("adminUpi").value;
  const amount = document.getElementById("adminAmount").value;

  if (!upiId || !amount) {
    showToast("Please enter both UPI ID and Amount");
    return;
  }

  set(ref(db, "settings"), {
    upi: upiId,
    amount: amount
  }).then(() => {
    showToast("UPI & Amount Updated!");
  });
});

// ------------------------ Show Chart ------------------------
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

// ------------------------ Show Toast ------------------------
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ------------------------ Initial Load ------------------------
document.getElementById("filterDate").addEventListener("change", loadTransactions);
loadTransactions();

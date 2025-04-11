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
          <p><b>UTR:</b> ${txn.utr}</p>
          <p><b>Amount:</b> ₹${txn.amount}</p>
          <p><b>App:</b> ${txn.app || '-'}</p>
          <p><b>Status:</b> ${txn.status}</p>
          <p><b>Date:</b> ${txn.date}</p>
          ${txn.status === "pending" ? `<button data-id="${key}">Approve</button>` : ''}
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

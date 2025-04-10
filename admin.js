import { db, ref, onValue, update } from './firebase-config.js';

const transactionList = document.getElementById('transactionList');

function loadTransactions() {
  const paymentsRef = ref(db, 'payments');
  onValue(paymentsRef, (snapshot) => {
    transactionList.innerHTML = '';
    const data = snapshot.val();
    if (data) {
      Object.entries(data).forEach(([txnId, txn]) => {
        const card = document.createElement('div');
        card.className = 'transaction-card';

        card.innerHTML = `
          <p><strong>Txn ID:</strong> ${txnId}</p>
          <p><strong>UPI:</strong> ${txn.upi}</p>
          <p><strong>Amount:</strong> ₹${txn.amount}</p>
          <p><strong>Status:</strong> <span class="status">${txn.status}</span></p>
          ${txn.status !== 'success' ? `<button onclick="updateStatus('${txnId}')">Mark as Success</button>` : ''}
        `;

        transactionList.appendChild(card);
      });
    } else {
      transactionList.innerHTML = "<p>No transactions found.</p>";
    }
  });
}

window.updateStatus = function (txnId) {
  const statusRef = ref(db, `payments/${txnId}`);
  update(statusRef, { status: 'success' }).then(() => {
    alert(`Transaction ${txnId} marked as successful.`);
  });
};

loadTransactions();

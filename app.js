/**
 * Personal Finance Manager
 * A lightweight, offline-first expense tracking application
 */

// ==================== STATE MANAGEMENT ====================
let db = JSON.parse(localStorage.getItem('financeFinal') || '{"tx":[],"goal":0,"theme":"dark"}');
let editingIndex = -1;

// ==================== INITIALIZATION ====================
function init() {
  // Set initial theme
  if (db.theme === 'light') {
    document.body.classList.add('light');
    updateThemeIcon();
  }

  // Set goal value
  document.getElementById('goal').value = db.goal || 0;

  // Set today's date as default
  document.getElementById('date').valueAsDate = new Date();

  // Render initial state
  render();
}

// ==================== THEME TOGGLE ====================
document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light');
  db.theme = document.body.classList.contains('light') ? 'light' : 'dark';
  updateThemeIcon();
  save();
});

function updateThemeIcon() {
  const icon = document.querySelector('.theme-icon');
  icon.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
}

// ==================== TRANSACTION MANAGEMENT ====================

/**
 * Add or update a transaction
 */
function addTransaction() {
  const desc = document.getElementById('desc').value.trim();
  const amt = parseFloat(document.getElementById('amt').value);
  const type = document.getElementById('type').value;
  const cat = document.getElementById('cat').value;
  const date = document.getElementById('date').value;

  // Validation
  if (!desc || !amt || amt <= 0 || !date) {
    alert('Please fill in all fields with valid values');
    return;
  }

  const transaction = {
    d: desc,
    a: amt,
    t: type,
    c: cat,
    date: date
  };

  if (editingIndex >= 0) {
    db.tx[editingIndex] = transaction;
    editingIndex = -1;
  } else {
    db.tx.unshift(transaction);
  }

  // Reset form
  clearForm();
  save();
}

/**
 * Edit a transaction
 */
function editTransaction(index) {
  const tx = db.tx[index];
  editingIndex = index;

  document.getElementById('desc').value = tx.d;
  document.getElementById('amt').value = tx.a;
  document.getElementById('type').value = tx.t;
  document.getElementById('cat').value = tx.c;
  document.getElementById('date').value = tx.date;

  // Scroll to form
  document.querySelector('.input-section').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('desc').focus();
}

/**
 * Delete a transaction
 */
function deleteTransaction(index) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    db.tx.splice(index, 1);
    save();
  }
}

/**
 * Clear the input form
 */
function clearForm() {
  document.getElementById('desc').value = '';
  document.getElementById('amt').value = '';
  document.getElementById('type').value = 'income';
  document.getElementById('cat').value = 'Salary';
  document.getElementById('date').valueAsDate = new Date();
  editingIndex = -1;
}

// ==================== CALCULATIONS ====================

/**
 * Calculate financial statistics
 */
function calculateStats() {
  let income = 0;
  let expense = 0;

  db.tx.forEach(tx => {
    if (tx.t === 'income') {
      income += tx.a;
    } else {
      expense += tx.a;
    }
  });

  const balance = income - expense;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

  return { income, expense, balance, savingsRate };
}

/**
 * Get category icon
 */
function getCategoryIcon(category, type) {
  const icons = {
    income: {
      'Salary': '💼',
      'Freelance': '🎨',
      'Investment': '📈',
      'Other': '💰'
    },
    expense: {
      'Food': '🍔',
      'Transportation': '🚗',
      'Utilities': '⚡',
      'Entertainment': '🎬',
      'Shopping': '🛍️',
      'Other': '💸'
    }
  };

  return icons[type]?.[category] || (type === 'income' ? '📈' : '📉');
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format date
 */
function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

// ==================== RENDERING ====================

/**
 * Main render function
 */
function render() {
  // Get filter values
  const filterValue = document.getElementById('filter').value;
  const searchValue = document.getElementById('search').value.toLowerCase();

  // Calculate stats
  const stats = calculateStats();

  // Update dashboard
  updateDashboard(stats);

  // Update savings goal
  updateSavingsGoal(stats.balance);

  // Filter transactions
  const filtered = db.tx.filter(tx => {
    const matchesFilter = filterValue === 'all' || tx.t === filterValue;
    const matchesSearch = tx.d.toLowerCase().includes(searchValue) ||
                         tx.c.toLowerCase().includes(searchValue) ||
                         tx.a.toString().includes(searchValue);
    return matchesFilter && matchesSearch;
  });

  // Render transactions list
  renderTransactions(filtered);
}

/**
 * Update dashboard statistics
 */
function updateDashboard(stats) {
  document.getElementById('totalIncome').textContent = formatCurrency(stats.income);
  document.getElementById('totalExpense').textContent = formatCurrency(stats.expense);
  document.getElementById('netBalance').textContent = formatCurrency(stats.balance);
  document.getElementById('savingsRate').textContent = stats.savingsRate + '%';
}

/**
 * Update savings goal progress
 */
function updateSavingsGoal(balance) {
  const goal = parseFloat(document.getElementById('goal').value) || 0;
  const progress = goal > 0 ? (balance / goal) * 100 : 0;

  document.getElementById('prog').value = Math.min(progress, 100);
  document.getElementById('goalProgress').textContent = `${formatCurrency(balance)} / ${formatCurrency(goal)}`;
}

/**
 * Render transactions list
 */
function renderTransactions(transactions) {
  const list = document.getElementById('list');
  const emptyState = document.getElementById('emptyState');

  if (transactions.length === 0) {
    list.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  list.innerHTML = transactions.map((tx, index) => {
    const originalIndex = db.tx.indexOf(tx);
    const icon = getCategoryIcon(tx.c, tx.t);
    const sign = tx.t === 'income' ? '+' : '-';

    return `
      <li class="transaction-item ${tx.t}">
        <div class="transaction-info">
          <div class="transaction-icon">${icon}</div>
          <div class="transaction-details">
            <div class="transaction-description">${tx.d}</div>
            <div class="transaction-meta">
              <span class="transaction-category">${tx.c}</span>
              <span class="transaction-date">${formatDate(tx.date)}</span>
            </div>
          </div>
        </div>
        <div class="transaction-amount ${tx.t}">
          ${sign}${formatCurrency(tx.a)}
        </div>
        <div class="transaction-actions">
          <button class="action-btn edit" onclick="editTransaction(${originalIndex})" title="Edit">✏️</button>
          <button class="action-btn" onclick="deleteTransaction(${originalIndex})" title="Delete">🗑️</button>
        </div>
      </li>
    `;
  }).join('');
}

// ==================== SAVINGS GOAL ====================

/**
 * Save savings goal
 */
function saveGoal() {
  db.goal = parseFloat(document.getElementById('goal').value) || 0;
  save();
}

// ==================== DATA PERSISTENCE ====================

/**
 * Save data to localStorage
 */
function save() {
  localStorage.setItem('financeFinal', JSON.stringify(db));
  render();
}

/**
 * Export data as JSON
 */
function exportData() {
  const dataStr = JSON.stringify(db, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `finance-export-${new Date().toISOString().split('T')[0]}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Import data from JSON
 */
function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target?.result);

      if (!imported.tx || !Array.isArray(imported.tx)) {
        throw new Error('Invalid file format');
      }

      if (confirm('This will replace all your data. Are you sure?')) {
        db = imported;
        save();
        alert('Data imported successfully!');
      }
    } catch (err) {
      alert('Error importing file: ' + err.message);
    }
  };
  reader.readAsText(file);

  // Reset input
  event.target.value = '';
}

// ==================== STARTUP ====================
init();

import budgets from "./budgets.js";

const table = document.querySelector('.budgets table')
const newBudgetForm = document.querySelector('.new-budget form')
const newBudgetBtn = document.querySelector('.new-budget-btn')
const newBudgetClearBtn = document.querySelector('.new-budget-clear-btn')
const newBudgetSection = document.querySelector('.new-budget')
const messageSection = document.querySelector('.message')
const overlay = document.querySelector('.overlay')
const messageOverlay = document.querySelector('.mes-overlay')
const search = document.querySelector('.search')
const searchForm = search.querySelector('form')
const searchToggle = document.querySelector('.search-btn')
const allBudgetsBtn = document.querySelector('.all-btn')
const budgetMenuBtn = document.querySelector('.budget-menu-btn')
const budgetActions = document.querySelector('.action')
const searchStatus = document.querySelector('.search-status')
let editingBudgetId = null

init()
toggleMessage('Welcome to Budget tracker')

function init() {
  budgets.renderBudgets(table)
  budgets.renderSummary(table)

  newBudgetForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const type = newBudgetForm.querySelector('.type').value
    const description = newBudgetForm.querySelector('.description').value
    const amountValue = newBudgetForm.querySelector('.amount').value.trim()
    const amount = Number(amountValue)
    const normalizedType = capitalizeIndexOfString(type)
    const normalizedDescription = capitalizeIndexOfString(description)

    if (amountValue === '' || !Number.isFinite(amount) || amount < 0) {
      toggleMessage('Amount must be a valid number or decimal.')
      newBudgetForm.querySelector('.amount').value = ''

      return
    }

    if(!budgets.types.includes(normalizedType)){
      toggleMessage(`Type of budget must be either: 
${budgets.types.join(', ')}`)
      newBudgetForm.querySelector('.type').value = null

      return;
    } else if (normalizedType === 'Expense') {
      const oldBudget = editingBudgetId === null ? null : budgets.find(editingBudgetId)
      const availableBalance = oldBudget?.type === 'Expense'
        ? budgets.getBalance() + oldBudget.amount
        : budgets.getBalance()

      if (amount > availableBalance) {
        toggleMessage(`Can't add Budget to list due to the given amount $${budgets.formatCurrency(amount)} is higher than your balance $${budgets.formatCurrency(availableBalance)}. You need more Income`)

        newBudgetForm.querySelector('.amount').value = null

        return;
      }
    }

    const budget = editingBudgetId === null
      ? budgets.add(normalizedType, amount, normalizedDescription)
      : budgets.edit(editingBudgetId, {
        type: normalizedType,
        amount,
        description: normalizedDescription
      })

    budgets.renderBudgets(table)
    budgets.renderSummary(table)
    searchForm.querySelector('input').value = ''
    searchStatus.textContent = ''
    removeNewBudgetSection()
    newBudgetForm.reset()
    toggleMessage(`${editingBudgetId === null ? 'Added' : 'Updated'} successfully ☑️`)
    editingBudgetId = null
  })

  searchToggle.addEventListener('click', () => {
    toggleSearch()
  })

  budgetMenuBtn?.addEventListener('click', () => {
    const isOpen = budgetActions.classList.toggle('is-open')
    budgetMenuBtn.setAttribute('aria-expanded', String(isOpen))
  })

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const query = searchForm.querySelector('input').value.trim().toLowerCase()
    applyBudgetSearch(query)
    closeSearch()
  })

  allBudgetsBtn.addEventListener('click', () => {
    searchForm.querySelector('input').value = ''
    applyBudgetSearch('')
  })

  newBudgetBtn.addEventListener('click', () => {
    editingBudgetId = null
    toggleNewBudgetSection()
    newBudgetForm.reset()
  })

  newBudgetClearBtn.addEventListener('click', () => {
    if(budgets.length !== 0) {
      if(confirm(`Are you sure you want to clear ${budgets.length} budgets`)) {
        budgets.clear()
        budgets.renderBudgets(table)
        budgets.renderSummary(table)
        searchForm.querySelector('input').value = ''
        searchStatus.textContent = ''
      }
    } else {
      toggleMessage('No Budgets yet')
    }
  })

  overlay.addEventListener('click', () => {
    editingBudgetId = null
    closeMessage()
    removeNewBudgetSection()
    closeSearch()
  })

  messageSection.querySelector('.foot button').addEventListener('click', () => {
    closeMessage()
  })

  table.addEventListener('click', (e) => {
    const editButton = e.target.closest('.edit-btn')

    if (!editButton) {
      return
    }

    editingBudgetId = Number(editButton.dataset.rowId)
    const budget = budgets.find(editingBudgetId)

    newBudgetForm.querySelector('.type').value = budget.type
    newBudgetForm.querySelector('.description').value = budget.description
    newBudgetForm.querySelector('.amount').value = budget.amount
    toggleNewBudgetSection(`Edit Budget: ${budgets.find(editingBudgetId).description} ${budgets.find(editingBudgetId).type}`, 'Edit')
  })
}

function toggleNewBudgetSection(title = 'New Budget', btnTitle = 'Add') {
  newBudgetSection.querySelector('.title').textContent = title
  newBudgetSection.querySelector('button').textContent = btnTitle
  overlay.classList.add('toggle-overlay')
  newBudgetSection.classList.add('top-0')
}

function removeNewBudgetSection() {
  newBudgetSection.classList.remove('top-0')
  overlay.classList.remove('toggle-overlay')
}

export function toggleMessage(message = 'Message') {
  messageOverlay.classList.add('toggle-overlay')
  messageSection.classList.add('top-0') 
  messageSection.querySelector('.content').textContent = message
}

export function toggleSearch() {
  overlay.classList.add('toggle-overlay')
  search.classList.add('top-0') 
}

export function closeSearch() {
  overlay.classList.remove('toggle-overlay')
  search.classList.remove('top-0') 
}



export function closeMessage() {
  messageSection.classList.remove('top-0')
  messageOverlay.classList.remove('toggle-overlay')
}

function capitalizeIndexOfString(str, index = 0) {
  let string = str.toLowerCase()
  let list = []
  for(let i = 0; i<=string.length - 1; i++) {
    list.push(string[i])
  }

  let final = ''
  list[index] = list[index].toUpperCase()
  list.forEach(l => final+=l)
  return final;
}

function applyBudgetSearch(query) {
  const tableBody = table.querySelector('tbody')
  const rows = tableBody.querySelectorAll('tr[class^="tr-"]')
  const emptyRow = tableBody.querySelector('.search-empty-row')
  let visibleRows = 0

  emptyRow?.remove()

  rows.forEach(row => {
    const searchableText = Array.from(row.cells)
      .slice(0, 4)
      .map(cell => cell.textContent)
      .join(' ')
      .toLowerCase()
    const matches = query === '' || searchableText.includes(query)
    row.hidden = !matches

    if (matches) {
      visibleRows++
    }
  })

  if (rows.length > 0 && visibleRows === 0) {
    tableBody.insertAdjacentHTML('beforeend', '<tr class="search-empty-row"><td colspan="5">No matching budgets</td></tr>')
  }

  searchStatus.textContent = query === ''
    ? ''
    : `Search results for "${query}" (${visibleRows})`
}
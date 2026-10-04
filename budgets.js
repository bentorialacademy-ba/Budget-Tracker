class Budgets {
  #localStorageKey = 'budgets'
  types = ['Expense', 'Income']

  constructor() {
    this.list = this.get()
    this.length = this.get().length
  }
  
  get() {
    return JSON.parse(localStorage.getItem(this.#localStorageKey)) || []
  }

  add(type, amount, description) {
    const newExpense = {id: this.list.length + 1, type, amount, description}
    this.list.push(newExpense)
    this.save()
    this.length = this.get().length

    return newExpense;
  }

  find(budgetId) {
    return this.list.find(budget => budget.id === budgetId)
  }

  save() {
    localStorage.setItem(this.#localStorageKey, JSON.stringify(this.list))
  }

  delete(expenseId) {
    this.list = this.list.filter(l => l.id !== expenseId)
    this.list.forEach((l, index) => {
      l.id = index + 1
    })
    this.save()
    this.length = this.get().length
  }

  edit(expenseId, val) {
    const budget = this.find(expenseId)

    if (!budget) {
      return null
    }

    Object.assign(budget, val)
    this.save()

    this.length = this.get().length

    return budget
  }

  getTotalExpenses() {
    let total = 0

    this.list.forEach(l => {
      if(l.type === 'Expense') {
        total += l.amount
      }
    })

    return total
  }

  getTotalIncome() {
    let total = 0

    this.list.forEach(l => {
      if(l.type === 'Income') {
        total += l.amount
      }
    })

    return total
  }

  getBalance() {
    return this.getTotalIncome() - this.getTotalExpenses()
  }

  renderBudgets(table) {
    const tableBody = table.querySelector('tbody')
    document.querySelector('.budgetsLen').textContent = this.length

    if(this.list.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5">No Budgets yet</td></tr>'
      return
    } else {
      let rowHtml = ``
      this.list.forEach(l => {
        rowHtml += `
        <tr class="tr-${l.id}" title="${l.description} ${l.type}">
          <td>${l.id}</td>
          <td>${l.description}</td>
          <td>${l.type}</td>
          <td>$${this.formatCurrency(l.amount)}</td>
          <td>
            <button class="edit-btn" data-row-id="${l.id}" title="Edit ${l.type}"><i class="fa fa-edit"></i></button>
            <button class="delete-btn" data-row-id="${l.id}" title="Delete ${l.type}"><i class="fa fa-trash"></i></button>
          </td>
        </tr>
        `
      })
      tableBody.innerHTML = rowHtml
    }

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const {rowId} = btn.dataset

        if(confirm("Are you sure you want to delete this budget")) {
          this.delete(parseInt(rowId))
          document.querySelector(`.tr-${parseInt(rowId)}`).remove()
          this.renderBudgets(table)
          this.renderSummary(table)
        }
      })
    })

  }

  renderSummary(table) {
    const summaryBoard = document.querySelector('.summary')

    summaryBoard.querySelector('.total-income span').textContent = `$${this.formatCurrency(this.getTotalIncome())}`

    summaryBoard.querySelector('.total-expense span').textContent = `$${this.formatCurrency(this.getTotalExpenses())}`

    summaryBoard.querySelector('.balance span').textContent = `$${this.formatCurrency(this.getBalance())}`
  }

  formatCurrency(currency) {
    return currency === 0 ? `${currency}.00` : `${currency}`.includes('.') ? currency.toFixed(2) : `${currency}.00`
  }

  clear() {
    this.list = []
    localStorage.removeItem(this.#localStorageKey)
    this.length = this.get().length
  }
}

const budgets = new Budgets()
export default budgets
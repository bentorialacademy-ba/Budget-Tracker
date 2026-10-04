const contactForm = document.querySelector('.contact-form')
const contactNote = contactForm.querySelector('.contact-form-note')

contactForm.addEventListener('submit', (event) => {
  event.preventDefault()
  contactNote.className = 'contact-form-status'
  contactNote.textContent = 'Thanks. Your message is ready to send when a contact service is connected.'
  contactForm.clear()
})

contactForm.addEventListener('reset', () => {
  window.setTimeout(() => {
    contactNote.className = 'contact-form-note'
    contactNote.textContent = "We'll get back to you as soon as we can."
  }, 0)
})

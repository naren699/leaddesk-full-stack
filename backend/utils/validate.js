const BUDGETS = ['under-1k', '1k-5k', '5k-10k', '10k-plus'];
const STATUSES = ['New', 'Contacted', 'Closed'];

function validateLead(body) {
  const errors = {};
  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const budget = (body.budget || '').trim();
  const message = (body.message || '').trim();

  if (!name) errors.name = 'Name is required';
  else if (name.length > 100) errors.name = 'Name is too long';

  if (!email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email format';

  if (!budget) errors.budget = 'Budget range is required';
  else if (!BUDGETS.includes(budget)) errors.budget = 'Invalid budget range';

  if (!message) errors.message = 'Message is required';
  else if (message.length < 10) errors.message = 'Message must be at least 10 characters';
  else if (message.length > 2000) errors.message = 'Message is too long';

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { name, email, budget, message },
  };
}

module.exports = { validateLead, BUDGETS, STATUSES };
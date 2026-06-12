export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Contains uppercase letter',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'Contains lowercase letter',
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'Contains number',
    test: (password) => /[0-9]/.test(password),
  },
];

export const getPasswordValidation = (password) =>
  PASSWORD_RULES.map((rule) => ({
    ...rule,
    met: rule.test(password),
  }));

export const isPasswordValid = (password) =>
  PASSWORD_RULES.every((rule) => rule.test(password));

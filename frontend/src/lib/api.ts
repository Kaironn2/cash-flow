export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const endpoints = {
    register: `${API_URL}/authentication/register/`,
    login: `${API_URL}/authentication/token/`,
    categories: `${API_URL}/finances/categories/`,
    expenses: `${API_URL}/finances/expenses/`,
    recurring: `${API_URL}/finances/recurring-expenses/`,
    installments: `${API_URL}/finances/installment-expenses/`,
    expenseMonths: `${API_URL}/finances/expenses/months/`,
};

export const authHeader = (token: string) => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
});

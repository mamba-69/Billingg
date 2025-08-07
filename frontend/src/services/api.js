const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Handle empty responses
      const text = await response.text();
      if (text) {
        try {
          return JSON.parse(text);
        } catch (e) {
          return text;
        }
      }
      return null;
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  }

  // Generic CRUD methods
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Products
  async getProducts() {
    return this.get('/api/products');
  }

  async getProduct(id) {
    return this.get(`/api/products/${id}`);
  }

  async createProduct(product) {
    return this.post('/api/products', product);
  }

  async updateProduct(id, product) {
    return this.put(`/api/products/${id}`, product);
  }

  async deleteProduct(id) {
    return this.delete(`/api/products/${id}`);
  }

  // Customers
  async getCustomers() {
    return this.get('/api/customers');
  }

  async getCustomer(id) {
    return this.get(`/api/customers/${id}`);
  }

  async createCustomer(customer) {
    return this.post('/api/customers', customer);
  }

  async updateCustomer(id, customer) {
    return this.put(`/api/customers/${id}`, customer);
  }

  async deleteCustomer(id) {
    return this.delete(`/api/customers/${id}`);
  }

  // Companies
  async getCompanies() {
    return this.get('/api/companies');
  }

  async getCompany(id) {
    return this.get(`/api/companies/${id}`);
  }

  async createCompany(company) {
    return this.post('/api/companies', company);
  }

  async updateCompany(id, company) {
    return this.put(`/api/companies/${id}`, company);
  }

  async deleteCompany(id) {
    return this.delete(`/api/companies/${id}`);
  }

  // Invoices
  async getInvoices() {
    return this.get('/api/invoices');
  }

  async getInvoice(id) {
    return this.get(`/api/invoices/${id}`);
  }

  async createInvoice(invoice) {
    return this.post('/api/invoices', invoice);
  }

  async updateInvoice(id, invoice) {
    return this.put(`/api/invoices/${id}`, invoice);
  }

  async deleteInvoice(id) {
    return this.delete(`/api/invoices/${id}`);
  }

  // Seed database
  async seedDatabase() {
    return this.post('/api/seed', {});
  }
}

const apiService = new ApiService(API_BASE_URL);
export default apiService;
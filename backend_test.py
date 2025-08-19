#!/usr/bin/env python3
"""
Backend API Testing for Inventory Management System
Tests all CRUD operations for Products, Customers, Companies, and Invoices
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import sys

# Backend URL from frontend .env
BASE_URL = "https://smart-import-tool.preview.emergentagent.com/api"

class InventoryAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
        
    def log_result(self, test_name, success, message=""):
        if success:
            self.test_results["passed"] += 1
            print(f"✅ {test_name}: PASSED {message}")
        else:
            self.test_results["failed"] += 1
            self.test_results["errors"].append(f"{test_name}: {message}")
            print(f"❌ {test_name}: FAILED {message}")
    
    def test_database_seeding(self):
        """Test POST /api/seed endpoint"""
        print("\n=== Testing Database Seeding ===")
        
        try:
            response = self.session.post(f"{self.base_url}/seed")
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "data" in data:
                    self.log_result("Database Seeding", True, f"Seeded {data['data']}")
                    return True
                else:
                    self.log_result("Database Seeding", False, "Invalid response format")
                    return False
            else:
                self.log_result("Database Seeding", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Database Seeding", False, f"Exception: {str(e)}")
            return False
    
    def test_products_crud(self):
        """Test Products CRUD operations"""
        print("\n=== Testing Products CRUD ===")
        
        # Test GET all products
        try:
            response = self.session.get(f"{self.base_url}/products")
            if response.status_code == 200:
                products = response.json()
                self.log_result("GET Products", True, f"Retrieved {len(products)} products")
            else:
                self.log_result("GET Products", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("GET Products", False, f"Exception: {str(e)}")
            return False
        
        # Test POST create product
        test_product = {
            "name": "Test Gaming Mouse",
            "sku": "TGM-001",
            "category": "Electronics",
            "price": 1299.0,
            "stock": 75,
            "minStock": 15,
            "unit": "piece",
            "hsn": "84716020",
            "gstRate": 18,
            "supplier": "Gaming Gear Ltd"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/products", json=test_product)
            if response.status_code == 200:
                created_product = response.json()
                product_id = created_product["id"]
                
                # Verify GST and HSN data
                if created_product["hsn"] == "84716020" and created_product["gstRate"] == 18:
                    self.log_result("POST Product with GST/HSN", True, f"Created product ID: {product_id}")
                else:
                    self.log_result("POST Product with GST/HSN", False, "GST/HSN data not stored correctly")
                    return False
            else:
                self.log_result("POST Product", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_result("POST Product", False, f"Exception: {str(e)}")
            return False
        
        # Test GET single product
        try:
            response = self.session.get(f"{self.base_url}/products/{product_id}")
            if response.status_code == 200:
                product = response.json()
                self.log_result("GET Single Product", True, f"Retrieved product: {product['name']}")
            else:
                self.log_result("GET Single Product", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("GET Single Product", False, f"Exception: {str(e)}")
            return False
        
        # Test PUT update product
        update_data = {
            "price": 1399.0,
            "stock": 80,
            "gstRate": 28
        }
        
        try:
            response = self.session.put(f"{self.base_url}/products/{product_id}", json=update_data)
            if response.status_code == 200:
                updated_product = response.json()
                if updated_product["price"] == 1399.0 and updated_product["gstRate"] == 28:
                    self.log_result("PUT Product Update", True, "Product updated successfully")
                else:
                    self.log_result("PUT Product Update", False, "Update data not applied correctly")
                    return False
            else:
                self.log_result("PUT Product Update", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("PUT Product Update", False, f"Exception: {str(e)}")
            return False
        
        # Test DELETE product
        try:
            response = self.session.delete(f"{self.base_url}/products/{product_id}")
            if response.status_code == 200:
                self.log_result("DELETE Product", True, "Product deleted successfully")
            else:
                self.log_result("DELETE Product", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("DELETE Product", False, f"Exception: {str(e)}")
            return False
        
        return True
    
    def test_customers_crud(self):
        """Test Customers CRUD operations"""
        print("\n=== Testing Customers CRUD ===")
        
        # Test GET all customers
        try:
            response = self.session.get(f"{self.base_url}/customers")
            if response.status_code == 200:
                customers = response.json()
                self.log_result("GET Customers", True, f"Retrieved {len(customers)} customers")
            else:
                self.log_result("GET Customers", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("GET Customers", False, f"Exception: {str(e)}")
            return False
        
        # Test POST create customer
        test_customer = {
            "name": "Innovative Solutions Ltd",
            "email": "billing@innovative.com",
            "phone": "+91 9988776655",
            "address": "Plot 45, Sector 18, Noida 201301",
            "gstin": "09AAPFU0939F1ZA"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/customers", json=test_customer)
            if response.status_code == 200:
                created_customer = response.json()
                customer_id = created_customer["id"]
                
                # Verify GSTIN data
                if created_customer["gstin"] == "09AAPFU0939F1ZA":
                    self.log_result("POST Customer with GSTIN", True, f"Created customer ID: {customer_id}")
                else:
                    self.log_result("POST Customer with GSTIN", False, "GSTIN data not stored correctly")
                    return False
            else:
                self.log_result("POST Customer", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_result("POST Customer", False, f"Exception: {str(e)}")
            return False
        
        # Test GET single customer
        try:
            response = self.session.get(f"{self.base_url}/customers/{customer_id}")
            if response.status_code == 200:
                customer = response.json()
                self.log_result("GET Single Customer", True, f"Retrieved customer: {customer['name']}")
            else:
                self.log_result("GET Single Customer", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("GET Single Customer", False, f"Exception: {str(e)}")
            return False
        
        # Test PUT update customer
        update_data = {
            "phone": "+91 9988776600",
            "address": "Plot 46, Sector 18, Noida 201301",
            "status": "active"
        }
        
        try:
            response = self.session.put(f"{self.base_url}/customers/{customer_id}", json=update_data)
            if response.status_code == 200:
                updated_customer = response.json()
                if updated_customer["phone"] == "+91 9988776600":
                    self.log_result("PUT Customer Update", True, "Customer updated successfully")
                else:
                    self.log_result("PUT Customer Update", False, "Update data not applied correctly")
                    return False
            else:
                self.log_result("PUT Customer Update", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("PUT Customer Update", False, f"Exception: {str(e)}")
            return False
        
        # Test DELETE customer
        try:
            response = self.session.delete(f"{self.base_url}/customers/{customer_id}")
            if response.status_code == 200:
                self.log_result("DELETE Customer", True, "Customer deleted successfully")
            else:
                self.log_result("DELETE Customer", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("DELETE Customer", False, f"Exception: {str(e)}")
            return False
        
        return True
    
    def test_companies_crud(self):
        """Test Companies CRUD operations"""
        print("\n=== Testing Companies CRUD ===")
        
        # Test GET all companies
        try:
            response = self.session.get(f"{self.base_url}/companies")
            if response.status_code == 200:
                companies = response.json()
                self.log_result("GET Companies", True, f"Retrieved {len(companies)} companies")
            else:
                self.log_result("GET Companies", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("GET Companies", False, f"Exception: {str(e)}")
            return False
        
        # Test POST create company
        test_company = {
            "name": "Test Enterprise Pvt Ltd",
            "email": "admin@testenterprise.com",
            "phone": "+91 8877665544",
            "address": "Corporate Tower, Business District, Pune 411001",
            "gstin": "27AAPFU0939F1ZB",
            "logo": "https://example.com/logo.png"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/companies", json=test_company)
            if response.status_code == 200:
                created_company = response.json()
                company_id = created_company["id"]
                
                # Verify GST info
                if created_company["gstin"] == "27AAPFU0939F1ZB":
                    self.log_result("POST Company with GST", True, f"Created company ID: {company_id}")
                else:
                    self.log_result("POST Company with GST", False, "GST data not stored correctly")
                    return False
            else:
                self.log_result("POST Company", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_result("POST Company", False, f"Exception: {str(e)}")
            return False
        
        # Test GET single company
        try:
            response = self.session.get(f"{self.base_url}/companies/{company_id}")
            if response.status_code == 200:
                company = response.json()
                self.log_result("GET Single Company", True, f"Retrieved company: {company['name']}")
            else:
                self.log_result("GET Single Company", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("GET Single Company", False, f"Exception: {str(e)}")
            return False
        
        # Test PUT update company
        update_data = {
            "phone": "+91 8877665500",
            "logo": "https://example.com/new-logo.png"
        }
        
        try:
            response = self.session.put(f"{self.base_url}/companies/{company_id}", json=update_data)
            if response.status_code == 200:
                updated_company = response.json()
                if updated_company["phone"] == "+91 8877665500":
                    self.log_result("PUT Company Update", True, "Company updated successfully")
                else:
                    self.log_result("PUT Company Update", False, "Update data not applied correctly")
                    return False
            else:
                self.log_result("PUT Company Update", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("PUT Company Update", False, f"Exception: {str(e)}")
            return False
        
        # Test DELETE company
        try:
            response = self.session.delete(f"{self.base_url}/companies/{company_id}")
            if response.status_code == 200:
                self.log_result("DELETE Company", True, "Company deleted successfully")
            else:
                self.log_result("DELETE Company", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("DELETE Company", False, f"Exception: {str(e)}")
            return False
        
        return True
    
    def test_invoices_crud(self):
        """Test Invoices CRUD operations with GST calculations"""
        print("\n=== Testing Invoices CRUD ===")
        
        # First, get existing products and customers for invoice creation
        try:
            products_response = self.session.get(f"{self.base_url}/products")
            customers_response = self.session.get(f"{self.base_url}/customers")
            
            if products_response.status_code != 200 or customers_response.status_code != 200:
                self.log_result("Invoice Prerequisites", False, "Could not fetch products/customers")
                return False
                
            products = products_response.json()
            customers = customers_response.json()
            
            if not products or not customers:
                self.log_result("Invoice Prerequisites", False, "No products or customers available")
                return False
                
        except Exception as e:
            self.log_result("Invoice Prerequisites", False, f"Exception: {str(e)}")
            return False
        
        # Test GET all invoices
        try:
            response = self.session.get(f"{self.base_url}/invoices")
            if response.status_code == 200:
                invoices = response.json()
                self.log_result("GET Invoices", True, f"Retrieved {len(invoices)} invoices")
            else:
                self.log_result("GET Invoices", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("GET Invoices", False, f"Exception: {str(e)}")
            return False
        
        # Test POST create invoice with GST calculations
        product = products[0]
        customer = customers[0]
        
        test_invoice = {
            "invoiceNumber": f"TEST-INV-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "customerId": customer["id"],
            "customerName": customer["name"],
            "customerEmail": customer["email"],
            "customerPhone": customer["phone"],
            "customerAddress": customer["address"],
            "customerGSTIN": customer["gstin"],
            "date": datetime.now().strftime('%Y-%m-%d'),
            "dueDate": (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
            "items": [
                {
                    "productId": product["id"],
                    "name": product["name"],
                    "sku": product["sku"],
                    "category": product["category"],
                    "quantity": 3,
                    "price": product["price"],
                    "unit": product["unit"],
                    "hsn": product["hsn"],
                    "gstRate": product["gstRate"],
                    "amount": product["price"] * 3
                }
            ],
            "notes": "Test invoice for API validation",
            "status": "draft"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/invoices", json=test_invoice)
            if response.status_code == 200:
                created_invoice = response.json()
                invoice_id = created_invoice["id"]
                
                # Verify GST calculations
                expected_amount = product["price"] * 3
                expected_gst = expected_amount * product["gstRate"] / 100
                expected_total = expected_amount + expected_gst
                
                if (abs(created_invoice["amount"] - expected_amount) < 0.01 and
                    abs(created_invoice["gstAmount"] - expected_gst) < 0.01 and
                    abs(created_invoice["totalAmount"] - expected_total) < 0.01):
                    self.log_result("POST Invoice with GST Calculations", True, 
                                  f"Created invoice ID: {invoice_id}, Total: {created_invoice['totalAmount']}")
                else:
                    self.log_result("POST Invoice with GST Calculations", False, 
                                  f"GST calculations incorrect. Expected: {expected_total}, Got: {created_invoice['totalAmount']}")
                    return False
            else:
                self.log_result("POST Invoice", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_result("POST Invoice", False, f"Exception: {str(e)}")
            return False
        
        # Test GET single invoice
        try:
            response = self.session.get(f"{self.base_url}/invoices/{invoice_id}")
            if response.status_code == 200:
                invoice = response.json()
                self.log_result("GET Single Invoice", True, f"Retrieved invoice: {invoice['invoiceNumber']}")
            else:
                self.log_result("GET Single Invoice", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("GET Single Invoice", False, f"Exception: {str(e)}")
            return False
        
        # Test PUT update invoice
        update_data = {
            "status": "pending",
            "notes": "Updated test invoice - payment pending"
        }
        
        try:
            response = self.session.put(f"{self.base_url}/invoices/{invoice_id}", json=update_data)
            if response.status_code == 200:
                updated_invoice = response.json()
                if updated_invoice["status"] == "pending":
                    self.log_result("PUT Invoice Update", True, "Invoice updated successfully")
                else:
                    self.log_result("PUT Invoice Update", False, "Update data not applied correctly")
                    return False
            else:
                self.log_result("PUT Invoice Update", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("PUT Invoice Update", False, f"Exception: {str(e)}")
            return False
        
        # Test DELETE invoice
        try:
            response = self.session.delete(f"{self.base_url}/invoices/{invoice_id}")
            if response.status_code == 200:
                self.log_result("DELETE Invoice", True, "Invoice deleted successfully")
            else:
                self.log_result("DELETE Invoice", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("DELETE Invoice", False, f"Exception: {str(e)}")
            return False
        
        return True
    
    def test_error_handling(self):
        """Test error handling for invalid data"""
        print("\n=== Testing Error Handling ===")
        
        # Test invalid product creation
        invalid_product = {
            "name": "",  # Empty name should fail
            "price": -100,  # Negative price should fail
            "stock": "invalid"  # Invalid stock type
        }
        
        try:
            response = self.session.post(f"{self.base_url}/products", json=invalid_product)
            if response.status_code >= 400:
                self.log_result("Invalid Product Creation", True, f"Correctly rejected with status {response.status_code}")
            else:
                self.log_result("Invalid Product Creation", False, "Should have rejected invalid data")
        except Exception as e:
            self.log_result("Invalid Product Creation", False, f"Exception: {str(e)}")
        
        # Test non-existent resource access
        fake_id = str(uuid.uuid4())
        try:
            response = self.session.get(f"{self.base_url}/products/{fake_id}")
            if response.status_code == 404:
                self.log_result("Non-existent Product Access", True, "Correctly returned 404")
            else:
                self.log_result("Non-existent Product Access", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_result("Non-existent Product Access", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Inventory Management System Backend API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Run tests in order
        seed_success = self.test_database_seeding()
        
        if seed_success:
            self.test_products_crud()
            self.test_customers_crud()
            self.test_companies_crud()
            self.test_invoices_crud()
        else:
            print("⚠️  Skipping CRUD tests due to seeding failure")
        
        self.test_error_handling()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        
        if self.test_results['errors']:
            print("\n🔍 FAILED TESTS:")
            for error in self.test_results['errors']:
                print(f"   • {error}")
        
        success_rate = (self.test_results['passed'] / 
                       (self.test_results['passed'] + self.test_results['failed'])) * 100
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        if self.test_results['failed'] == 0:
            print("🎉 All tests passed! Backend APIs are working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Please check the errors above.")
            return False

if __name__ == "__main__":
    tester = InventoryAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
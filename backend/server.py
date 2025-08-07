from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, date
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'inventory_system')]

# Create the main app without a prefix
app = FastAPI(title="Inventory Management System", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusEnum(str, Enum):
    active = "active"
    inactive = "inactive"
    draft = "draft"
    paid = "paid"
    pending = "pending"
    overdue = "overdue"

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    sku: str
    category: str
    price: float
    stock: int
    minStock: int = 5
    unit: str = "piece"
    hsn: str = ""
    gstRate: int = 18
    supplier: str = ""
    lastUpdated: str = Field(default_factory=lambda: datetime.now().strftime('%Y-%m-%d'))

class ProductCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    category: str
    price: float
    stock: int
    minStock: int = 5
    unit: str = "piece"
    hsn: str = ""
    gstRate: int = 18
    supplier: str = ""

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    minStock: Optional[int] = None
    unit: Optional[str] = None
    hsn: Optional[str] = None
    gstRate: Optional[int] = None
    supplier: Optional[str] = None

class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    address: str = ""
    gstin: str = ""
    outstanding: float = 0.0
    totalBusiness: float = 0.0
    lastInvoice: Optional[str] = None
    status: StatusEnum = StatusEnum.active

class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: str
    address: str = ""
    gstin: str = ""

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    gstin: Optional[str] = None
    status: Optional[StatusEnum] = None

class Company(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    address: str = ""
    gstin: str = ""
    logo: str = ""
    createdAt: str = Field(default_factory=lambda: datetime.now().isoformat())

class CompanyCreate(BaseModel):
    name: str
    email: str
    phone: str
    address: str = ""
    gstin: str = ""
    logo: str = ""

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    gstin: Optional[str] = None
    logo: Optional[str] = None

class InvoiceItem(BaseModel):
    productId: str
    name: str
    sku: str
    category: str = "General"
    quantity: int
    price: float
    unit: str = "piece"
    hsn: str = ""
    gstRate: int = 18
    amount: float

class Invoice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoiceNumber: str
    customerId: str
    customerName: str
    customerEmail: str = ""
    customerPhone: str = ""
    customerAddress: str = ""
    customerGSTIN: str = ""
    date: str
    dueDate: str
    items: List[InvoiceItem]
    amount: float
    gstAmount: float
    totalAmount: float
    notes: str = ""
    status: StatusEnum = StatusEnum.draft

class InvoiceCreate(BaseModel):
    invoiceNumber: str
    customerId: str
    customerName: str
    customerEmail: str = ""
    customerPhone: str = ""
    customerAddress: str = ""
    customerGSTIN: str = ""
    date: str
    dueDate: str
    items: List[InvoiceItem]
    notes: str = ""
    status: StatusEnum = StatusEnum.draft

class InvoiceUpdate(BaseModel):
    invoiceNumber: Optional[str] = None
    customerId: Optional[str] = None
    customerName: Optional[str] = None
    customerEmail: Optional[str] = None
    customerPhone: Optional[str] = None
    customerAddress: Optional[str] = None
    customerGSTIN: Optional[str] = None
    date: Optional[str] = None
    dueDate: Optional[str] = None
    items: Optional[List[InvoiceItem]] = None
    notes: Optional[str] = None
    status: Optional[StatusEnum] = None

# Basic status check models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Inventory Management System API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# ========== PRODUCT ENDPOINTS ==========
@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    product_dict = product.dict()
    if not product_dict.get('sku'):
        product_dict['sku'] = f"SKU-{datetime.now().timestamp()}"
    
    product_obj = Product(**product_dict)
    await db.products.insert_one(product_obj.dict())
    return product_obj

@api_router.get("/products", response_model=List[Product])
async def get_products():
    products = await db.products.find().to_list(1000)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductUpdate):
    existing_product = await db.products.find_one({"id": product_id})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in product.dict().items() if v is not None}
    update_data['lastUpdated'] = datetime.now().strftime('%Y-%m-%d')
    
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    updated_product = await db.products.find_one({"id": product_id})
    return Product(**updated_product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}


# ========== CUSTOMER ENDPOINTS ==========
@api_router.post("/customers", response_model=Customer)
async def create_customer(customer: CustomerCreate):
    customer_dict = customer.dict()
    customer_obj = Customer(**customer_dict)
    await db.customers.insert_one(customer_obj.dict())
    return customer_obj

@api_router.get("/customers", response_model=List[Customer])
async def get_customers():
    customers = await db.customers.find().to_list(1000)
    return [Customer(**customer) for customer in customers]

@api_router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str):
    customer = await db.customers.find_one({"id": customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return Customer(**customer)

@api_router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer: CustomerUpdate):
    existing_customer = await db.customers.find_one({"id": customer_id})
    if not existing_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    update_data = {k: v for k, v in customer.dict().items() if v is not None}
    
    await db.customers.update_one({"id": customer_id}, {"$set": update_data})
    updated_customer = await db.customers.find_one({"id": customer_id})
    return Customer(**updated_customer)

@api_router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str):
    result = await db.customers.delete_one({"id": customer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted successfully"}


# ========== COMPANY ENDPOINTS ==========
@api_router.post("/companies", response_model=Company)
async def create_company(company: CompanyCreate):
    company_dict = company.dict()
    company_obj = Company(**company_dict)
    await db.companies.insert_one(company_obj.dict())
    return company_obj

@api_router.get("/companies", response_model=List[Company])
async def get_companies():
    companies = await db.companies.find().to_list(1000)
    return [Company(**company) for company in companies]

@api_router.get("/companies/{company_id}", response_model=Company)
async def get_company(company_id: str):
    company = await db.companies.find_one({"id": company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return Company(**company)

@api_router.put("/companies/{company_id}", response_model=Company)
async def update_company(company_id: str, company: CompanyUpdate):
    existing_company = await db.companies.find_one({"id": company_id})
    if not existing_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    update_data = {k: v for k, v in company.dict().items() if v is not None}
    
    await db.companies.update_one({"id": company_id}, {"$set": update_data})
    updated_company = await db.companies.find_one({"id": company_id})
    return Company(**updated_company)

@api_router.delete("/companies/{company_id}")
async def delete_company(company_id: str):
    result = await db.companies.delete_one({"id": company_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"message": "Company deleted successfully"}


# ========== INVOICE ENDPOINTS ==========
@api_router.post("/invoices", response_model=Invoice)
async def create_invoice(invoice: InvoiceCreate):
    invoice_dict = invoice.dict()
    
    # Calculate amounts
    amount = sum(item['amount'] for item in invoice_dict['items'])
    gst_amount = sum(item['amount'] * item['gstRate'] / 100 for item in invoice_dict['items'])
    total_amount = amount + gst_amount
    
    invoice_dict.update({
        'amount': amount,
        'gstAmount': gst_amount,
        'totalAmount': total_amount
    })
    
    invoice_obj = Invoice(**invoice_dict)
    await db.invoices.insert_one(invoice_obj.dict())
    return invoice_obj

@api_router.get("/invoices", response_model=List[Invoice])
async def get_invoices():
    invoices = await db.invoices.find().to_list(1000)
    return [Invoice(**invoice) for invoice in invoices]

@api_router.get("/invoices/{invoice_id}", response_model=Invoice)
async def get_invoice(invoice_id: str):
    invoice = await db.invoices.find_one({"id": invoice_id})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return Invoice(**invoice)

@api_router.put("/invoices/{invoice_id}", response_model=Invoice)
async def update_invoice(invoice_id: str, invoice: InvoiceUpdate):
    existing_invoice = await db.invoices.find_one({"id": invoice_id})
    if not existing_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    update_data = {k: v for k, v in invoice.dict().items() if v is not None}
    
    # Recalculate amounts if items are updated
    if 'items' in update_data:
        amount = sum(item['amount'] for item in update_data['items'])
        gst_amount = sum(item['amount'] * item['gstRate'] / 100 for item in update_data['items'])
        update_data.update({
            'amount': amount,
            'gstAmount': gst_amount,
            'totalAmount': amount + gst_amount
        })
    
    await db.invoices.update_one({"id": invoice_id}, {"$set": update_data})
    updated_invoice = await db.invoices.find_one({"id": invoice_id})
    return Invoice(**updated_invoice)

@api_router.delete("/invoices/{invoice_id}")
async def delete_invoice(invoice_id: str):
    result = await db.invoices.delete_one({"id": invoice_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"message": "Invoice deleted successfully"}


# ========== SEED ENDPOINT ==========
@api_router.post("/seed")
async def seed_database():
    """Seed the database with sample data"""
    # Clear existing data
    await db.products.delete_many({})
    await db.customers.delete_many({})
    await db.companies.delete_many({})
    await db.invoices.delete_many({})
    
    # Seed Products
    sample_products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Wireless Bluetooth Headphones",
            "sku": "WBH-001",
            "category": "Electronics",
            "price": 2499.0,
            "stock": 50,
            "minStock": 10,
            "unit": "piece",
            "hsn": "85183000",
            "gstRate": 18,
            "supplier": "Audio Tech Supplies",
            "lastUpdated": "2024-07-25"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Smart LED Bulb",
            "sku": "SLB-002",
            "category": "Electronics",
            "price": 899.0,
            "stock": 100,
            "minStock": 20,
            "unit": "piece",
            "hsn": "85395000",
            "gstRate": 18,
            "supplier": "Lighting Solutions",
            "lastUpdated": "2024-07-25"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Office Chair",
            "sku": "OC-003",
            "category": "Furniture",
            "price": 5999.0,
            "stock": 25,
            "minStock": 5,
            "unit": "piece",
            "hsn": "94013000",
            "gstRate": 18,
            "supplier": "Furniture Hub",
            "lastUpdated": "2024-07-25"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Notebook - A4",
            "sku": "NB-004",
            "category": "Stationery",
            "price": 120.0,
            "stock": 200,
            "minStock": 50,
            "unit": "piece",
            "hsn": "48201000",
            "gstRate": 12,
            "supplier": "Paper Works",
            "lastUpdated": "2024-07-25"
        }
    ]
    
    # Seed Customers
    sample_customers = [
        {
            "id": str(uuid.uuid4()),
            "name": "Acme Corporation",
            "email": "billing@acme.com",
            "phone": "+91 9876543210",
            "address": "789 Industrial Area, Delhi 110001",
            "gstin": "07AAPFU0939F1ZV",
            "outstanding": 5000.0,
            "totalBusiness": 25000.0,
            "lastInvoice": "2024-07-20",
            "status": "active"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Tech Solutions Pvt Ltd",
            "email": "accounts@techsol.com",
            "phone": "+91 8765432109",
            "address": "456 Tech Park, Bangalore 560001",
            "gstin": "29AAPFU0939F1ZW",
            "outstanding": 0.0,
            "totalBusiness": 15000.0,
            "lastInvoice": "2024-07-15",
            "status": "active"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Global Enterprises",
            "email": "info@global.com",
            "phone": "+91 7654321098",
            "address": "123 Business District, Mumbai 400001",
            "gstin": "27AAPFU0939F1ZX",
            "outstanding": 2500.0,
            "totalBusiness": 50000.0,
            "lastInvoice": "2024-07-22",
            "status": "active"
        }
    ]
    
    # Seed Companies
    sample_companies = [
        {
            "id": str(uuid.uuid4()),
            "name": "My Business Inc",
            "email": "contact@mybusiness.com",
            "phone": "+91 9999888877",
            "address": "Corporate Office, Business Hub, Chennai 600001",
            "gstin": "33AAPFU0939F1ZY",
            "logo": "",
            "createdAt": datetime.now().isoformat()
        }
    ]
    
    # Insert seed data
    await db.products.insert_many(sample_products)
    await db.customers.insert_many(sample_customers)
    await db.companies.insert_many(sample_companies)
    
    # Create a sample invoice
    invoice_id = str(uuid.uuid4())
    sample_invoice = {
        "id": invoice_id,
        "invoiceNumber": "INV-001",
        "customerId": sample_customers[0]["id"],
        "customerName": sample_customers[0]["name"],
        "customerEmail": sample_customers[0]["email"],
        "customerPhone": sample_customers[0]["phone"],
        "customerAddress": sample_customers[0]["address"],
        "customerGSTIN": sample_customers[0]["gstin"],
        "date": "2024-07-20",
        "dueDate": "2024-08-19",
        "items": [
            {
                "productId": sample_products[0]["id"],
                "name": sample_products[0]["name"],
                "sku": sample_products[0]["sku"],
                "category": sample_products[0]["category"],
                "quantity": 2,
                "price": sample_products[0]["price"],
                "unit": sample_products[0]["unit"],
                "hsn": sample_products[0]["hsn"],
                "gstRate": sample_products[0]["gstRate"],
                "amount": sample_products[0]["price"] * 2
            }
        ],
        "amount": sample_products[0]["price"] * 2,
        "gstAmount": (sample_products[0]["price"] * 2) * 18 / 100,
        "totalAmount": (sample_products[0]["price"] * 2) + ((sample_products[0]["price"] * 2) * 18 / 100),
        "notes": "Payment due in 30 days",
        "status": "pending"
    }
    
    await db.invoices.insert_one(sample_invoice)
    
    return {
        "message": "Database seeded successfully",
        "data": {
            "products": len(sample_products),
            "customers": len(sample_customers),
            "companies": len(sample_companies),
            "invoices": 1
        }
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

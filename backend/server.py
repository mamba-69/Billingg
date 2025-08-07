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

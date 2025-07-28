from runScrape import get_price_smart_final
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from asyncio import to_thread
import io
import csv
import requests
import asyncio
import sys
import os

if sys.platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

app = FastAPI()

# Get environment variables with fallbacks
FRONTEND_ADDRESS = os.getenv('VITE_FRONT_END_ADDRESS', 'http://localhost:5173')
BACKEND_ADDRESS = os.getenv('VITE_BACK_END_ADDRESS', 'http://localhost:8000')
FRONTEND_ALT_ADDRESS = os.getenv('VITE_FRONT_END_ALT_ADDRESS', 'http://localhost:3000')

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ADDRESS, FRONTEND_ALT_ADDRESS],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/scrape")
async def scrape(csv_file: UploadFile = File(...), zip_code: str = Form(...)):
    print("1")
    try:
        # Read and parse the CSV file
        content = await csv_file.read()
        content_str = content.decode('utf-8')
       
        # Parse CSV content
        csv_reader = csv.DictReader(io.StringIO(content_str))
        
        # Extract product names from the 'product_name' column
        product_names = []
        for row in csv_reader:
            if 'product_name' in row and row['product_name'].strip():
                product_names.append(row['product_name'].strip())
        
        if not product_names:
            return {"error": "No product names found in CSV file"}
        
        # Call the scraping function with zip code and product list
        results = await to_thread(get_price_smart_final, zip_code, product_names)
        
        print("results: ", results)
        
        return {"results": results, "zip_code": zip_code, "products_processed": len(product_names)}
        
    except Exception as e:
        
        return {"error": f"Failed to process CSV file: {str(e)}"}

@app.get("/scrape")
def scrape_get():
    # Keep the original GET endpoint for backward compatibility
    # please do work here

    #example 
    results = get_price_smart_final("92260",["beef","pork","apples"])    
    return {"results":results}







@app.get("/download-template")
def download_csv_template():
    # Define the headers for the CSV
    headers = ["product_name"]

    # Create in-memory stream
    stream = io.StringIO()
    writer = csv.writer(stream)
    writer.writerow(headers)  # Write header row only

    # Rewind the stream to the beginning
    stream.seek(0)

    return StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=member_template.csv"}
    )












































import httpx

from playwright.sync_api import sync_playwright

@app.get("/store-number")
def get_store_number(zip: str):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("https://www.smartandfinal.com/store", timeout=60000)

        # Type the zip and press Enter
        page.fill('input[placeholder*="Enter"]', zip)
        page.press('input[placeholder*="Enter"]', "Enter")

        # Wait for results to load
        page.wait_for_selector('div[data-testid="store-item"]', timeout=15000)

        # Extract store numbers
        stores = page.query_selector_all('div[data-testid="store-item"]')
        store_numbers = []
        for store in stores:
            title = store.query_selector("h3").inner_text().strip()
            number = title.split(" - ")[0]
            store_numbers.append(number)

        browser.close()
        return {"store_numbers": store_numbers}
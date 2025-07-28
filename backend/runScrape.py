from playwright.sync_api import sync_playwright, TimeoutError

def get_price_smart_final(zip_code, query_items):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Launch visible browser
        page = browser.new_page()

        # STEP 1: Open 'https://www.smartandfinal.com/'
        page.goto("https://www.smartandfinal.com/")

            
        # STEP 2: Click on 'Shop in Store, Create a List'
        page.locator("text=Shop in Store, Create a List").click()
        
        # STEP 3: Type ZIP and click real dropdown suggestion (NO ENTER)
        page.locator("input[placeholder='Please enter your address.']").click()
        page.keyboard.type(zip_code, delay=1)
        # Wait and click the correct suggestion
        
        page.locator("div[class^='AddressAutosuggestion--']").first.wait_for()
        page.locator("div[class^='AddressAutosuggestion--']").first.click()
        # STEP 4: Click the 'Make My Store' button on the first result

        # Wait for the full list of stores to appear
       
        page.locator("ul[data-testid='ListContainer-testId'] li").first.wait_for()
        page.wait_for_timeout(1000) 
        # Then click the first 'Make My Store' button in that list
        page.locator("ul[data-testid='ListContainer-testId'] li button[data-testid^='selectStore-button-testId']").first.click()
        #page.wait_for_load_state("networkidle")  # wait until the site finishes re‑loading
        page.locator("input#searchInputField-desktop, input#searchInputField-mobile").first.wait_for(state="visible", timeout=30_000)

        products = []
        print("query_items value:", repr(query_items), flush=True)

        for item in query_items:
            # STEP 5 – type the item and hit <Enter>
            try:
                # desktop layout (default 1280‑px page playwright opens)
                search_input = page.locator("input#searchInputField-desktop").first
                search_input.wait_for(state="visible", timeout=120_000)
            except Exception:
                # if you ever run a narrow‑viewport browser and only the mobile field is visible
                search_input = page.locator("input#searchInputField-mobile").first
                search_input.wait_for(state="visible", timeout=120_000)

            search_input.click()
            search_input.fill("")
            search_input.fill(item)
            search_input.press("Enter")            # trigger the actual search
            




            # Grab the first product card and pull its name, price, and link.
            
            first_card = page.locator("article[data-testid^='ProductCardWrapper-']").first
            
            try:
                # wait until at least one card is attached to the DOM
                first_card.wait_for(state="attached", timeout=30_000)
            except TimeoutError:
                # still nothing after 30 s → treat as “not carried”
                products.append({"product_name": item, "price": None, "product_link": None})
                continue
            #first_card.wait_for(state="visible", timeout=300_000)



            try:
                first_card.wait_for(state="visible", timeout=30_000)
            except TimeoutError:
                print("[timeout] no visible card for", item)
                products.append({"product_name": item, "price": None, "product_link": None})
                continue
            

            # ---------- Product name ----------
            # The title is inside a <div id="productCard_title__…"> → <p>.
            name_raw = first_card.locator("div[id^='productCard_title__'] p").first.inner_text().strip()
            price_text = first_card.locator("[class^='ProductPrice--']").first.inner_text().strip()
            # name_raw looks like: "Gala Apples - 0.33 Pound, $0.33 avg/ea"
            # Split once on the comma so we keep the weight with the name.
            product_name, _, price_inline = name_raw.partition(",")

            # ---------- Price (fallback in case price_inline is empty) ----------
            if price_inline.strip():
                price_text = price_inline.strip()
            else:
                price_text = first_card.locator("[class^='ProductPrice--']").first.inner_text().strip()

            # ---------- Product page link ----------
            product_link = first_card.locator("a.ProductCardHiddenLink--f3oc79").get_attribute("href")

            newProduct = {
                "product_name": product_name.strip(),
                "price":        price_text,
                "product_link": product_link,
            }
            products.append(newProduct)
        return products
        
    #input("Press Enter to close the browser...")  # Pause so browser stays open

    return None





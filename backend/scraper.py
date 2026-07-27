import requests
from bs4 import BeautifulSoup

def get_current_catoid():
    """Find the catoid for the current/active Purdue catalog year"""
    url = "https://catalog.purdue.edu/index.php"
    response = requests.get(url, timeout=10)
    soup = BeautifulSoup(response.text, "html.parser")
    
    # Find the catalog dropdown — current year is the one WITHOUT "[ARCHIVED CATALOG]"
    select = soup.find("select", {"id": "catalog"})
    if select:
        for option in select.find_all("option"):
            if "ARCHIVED" not in option.text:
                return option["value"]
    return None

def find_program_poid(catoid: str, major: str) -> str:
    """Search the catalog for a program matching the major and return its poid"""
    search_url = f"https://catalog.purdue.edu/search_advanced.php?catoid={catoid}"
    # This part requires either using their search form endpoint or 
    # browsing the College of Science / Engineering program list pages
    # (We'll refine this together based on what major you're testing)
    pass

def get_purdue_program_requirements(major: str) -> str:
    """Fetch the real degree plan text for a given major"""
    catoid = get_current_catoid()
    if not catoid:
        return ""
    
    poid = find_program_poid(catoid, major)
    if not poid:
        return ""
    
    url = f"https://catalog.purdue.edu/preview_program.php?catoid={catoid}&poid={poid}"
    response = requests.get(url, timeout=10)
    soup = BeautifulSoup(response.text, "html.parser")
    
    # Grab just the main content block, strip nav/footer junk
    content = soup.find("td", class_="block_content")
    if content:
        return content.get_text(separator="\n", strip=True)
    return ""
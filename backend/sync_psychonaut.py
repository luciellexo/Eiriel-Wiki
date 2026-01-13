import requests
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
if not MONGO_URL:
    print("MONGO_URL not found")
    exit(1)

client = MongoClient(MONGO_URL)
db = client.get_database("app_db")
collection = db.get_collection("substances")

# Full query
query = """
{
    substances(limit: 5000) {
        name
        url
        featured
        summary
        roas {
            name
            dose {
                units
                threshold
                light { min max }
                common { min max }
                strong { min max }
                heavy
            }
            duration {
                onset { min max units }
                comeup { min max units }
                peak { min max units }
                offset { min max units }
                total { min max units }
                afterglow { min max units }
            }
            bioavailability { min max }
        }
        images {
            thumb
        }
        addictionPotential
        tolerance {
            full
            half
            zero
        }
        dangerousInteractions {
            name
        }
        unsafeInteractions {
            name
        }
        uncertainInteractions {
            name
        }
    }
}
"""

def sync_substances():
    print("Fetching data from PsychonautWiki...")
    try:
        response = requests.post('https://api.psychonautwiki.org/', json={'query': query}, timeout=60)
        if response.status_code != 200:
            print(f"Failed to fetch: {response.status_code}")
            return

        data = response.json()
        if 'errors' in data:
            print(f"GraphQL Errors: {data['errors']}")
            return

        substances = data.get('data', {}).get('substances', [])
        print(f"Found {len(substances)} substances. Updating database...")

        operations = []
        for sub in substances:
            # Clean up interaction lists to simple strings if needed, or keep object structure
            # The API returns {name: "Lithium"}, we might just want "Lithium"
            
            # Flatten interactions for easier querying
            interactions = []
            if sub.get('dangerousInteractions'):
                for i in sub['dangerousInteractions']:
                    interactions.append({'name': i['name'], 'status': 'Dangerous'})
            if sub.get('unsafeInteractions'):
                for i in sub['unsafeInteractions']:
                    interactions.append({'name': i['name'], 'status': 'Unsafe'})
            if sub.get('uncertainInteractions'):
                for i in sub['uncertainInteractions']:
                    interactions.append({'name': i['name'], 'status': 'Caution'})
            
            sub['interactions_flat'] = interactions
            
            # Upsert
            collection.replace_one({'name': sub['name']}, sub, upsert=True)
        
        print("Sync complete.")

    except Exception as e:
        print(f"Error during sync: {e}")

if __name__ == "__main__":
    sync_substances()

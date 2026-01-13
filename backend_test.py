#!/usr/bin/env python3
"""
Backend API Testing Script
Tests the substance tracker backend API endpoints
"""

import requests
import json
import sys
from typing import Dict, Any

# Backend URL from frontend environment
BACKEND_URL = "https://substancetracker.preview.emergentagent.com"

def test_health_endpoint() -> Dict[str, Any]:
    """Test the health check endpoint"""
    print("Testing GET /api/health...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/health", timeout=10)
        
        result = {
            "endpoint": "/api/health",
            "status_code": response.status_code,
            "success": response.status_code == 200,
            "response_data": response.json() if response.status_code == 200 else None,
            "error": None
        }
        
        if result["success"]:
            print(f"✅ Health check passed: {result['response_data']}")
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            result["error"] = response.text
            
        return result
        
    except Exception as e:
        print(f"❌ Health check failed with exception: {str(e)}")
        return {
            "endpoint": "/api/health",
            "status_code": None,
            "success": False,
            "response_data": None,
            "error": str(e)
        }

def test_substances_list_endpoint() -> Dict[str, Any]:
    """Test the substances list endpoint"""
    print("\nTesting GET /api/substances...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/substances", timeout=10)
        
        result = {
            "endpoint": "/api/substances",
            "status_code": response.status_code,
            "success": response.status_code == 200,
            "response_data": None,
            "error": None,
            "count": 0
        }
        
        if response.status_code == 200:
            data = response.json()
            result["response_data"] = data
            result["count"] = len(data) if isinstance(data, list) else 0
            print(f"✅ Substances list retrieved: {result['count']} substances found")
            
            # Show first few substances for verification
            if isinstance(data, list) and len(data) > 0:
                print("Sample substances:")
                for i, substance in enumerate(data[:5]):
                    print(f"  {i+1}. {substance.get('name', 'Unknown')}")
        else:
            print(f"❌ Substances list failed with status {response.status_code}")
            result["error"] = response.text
            
        return result
        
    except Exception as e:
        print(f"❌ Substances list failed with exception: {str(e)}")
        return {
            "endpoint": "/api/substances",
            "status_code": None,
            "success": False,
            "response_data": None,
            "error": str(e),
            "count": 0
        }

def test_substance_detail_endpoint(substance_name: str = "LSD") -> Dict[str, Any]:
    """Test the substance detail endpoint"""
    print(f"\nTesting GET /api/substances/{substance_name}...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/substances/{substance_name}", timeout=10)
        
        result = {
            "endpoint": f"/api/substances/{substance_name}",
            "status_code": response.status_code,
            "success": response.status_code == 200,
            "response_data": None,
            "error": None,
            "substance_name": substance_name
        }
        
        if response.status_code == 200:
            data = response.json()
            result["response_data"] = data
            print(f"✅ Substance detail retrieved for {substance_name}")
            print(f"   Name: {data.get('name', 'Unknown')}")
            print(f"   Summary: {data.get('summary', 'No summary')[:100]}...")
        elif response.status_code == 404:
            print(f"⚠️  Substance '{substance_name}' not found (404)")
            result["error"] = f"Substance '{substance_name}' not found"
        else:
            print(f"❌ Substance detail failed with status {response.status_code}")
            result["error"] = response.text
            
        return result
        
    except Exception as e:
        print(f"❌ Substance detail failed with exception: {str(e)}")
        return {
            "endpoint": f"/api/substances/{substance_name}",
            "status_code": None,
            "success": False,
            "response_data": None,
            "error": str(e),
            "substance_name": substance_name
        }

def try_alternative_substances(substances_list: list) -> Dict[str, Any]:
    """Try to find an alternative substance if LSD is not available"""
    common_substances = ["Caffeine", "Alcohol", "Cannabis", "Nicotine", "Aspirin"]
    
    # First try substances from the list
    if substances_list:
        for substance in substances_list[:5]:  # Try first 5 substances
            name = substance.get('name')
            if name:
                result = test_substance_detail_endpoint(name)
                if result["success"]:
                    return result
    
    # Then try common substances
    for substance in common_substances:
        result = test_substance_detail_endpoint(substance)
        if result["success"]:
            return result
    
    return {"success": False, "error": "No working substance found"}

def main():
    """Run all backend API tests"""
    print("=" * 60)
    print("BACKEND API TESTING")
    print("=" * 60)
    print(f"Backend URL: {BACKEND_URL}")
    
    results = []
    
    # Test 1: Health check
    health_result = test_health_endpoint()
    results.append(health_result)
    
    # Test 2: Substances list
    substances_result = test_substances_list_endpoint()
    results.append(substances_result)
    
    # Test 3: Substance detail (try LSD first)
    lsd_result = test_substance_detail_endpoint("LSD")
    results.append(lsd_result)
    
    # If LSD not found, try alternatives
    if not lsd_result["success"] and substances_result["success"]:
        print("\nLSD not found, trying alternative substances...")
        alt_result = try_alternative_substances(substances_result.get("response_data", []))
        if alt_result.get("success"):
            results.append(alt_result)
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for result in results:
        status = "✅ PASS" if result["success"] else "❌ FAIL"
        print(f"{status} - {result['endpoint']}")
        if not result["success"] and result.get("error"):
            print(f"     Error: {result['error']}")
        
        if result["success"]:
            passed += 1
        else:
            failed += 1
    
    print(f"\nResults: {passed} passed, {failed} failed")
    
    # Return results for programmatic use
    return {
        "total_tests": len(results),
        "passed": passed,
        "failed": failed,
        "results": results
    }

if __name__ == "__main__":
    main()
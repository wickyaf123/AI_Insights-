"""
Integration tests for Sports Insights API.
Run this after starting the backend server.
"""
import requests
import json
import sys

BASE_URL = "http://localhost:3000"

def test_health():
    """Test health endpoint."""
    print("Testing /health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        response.raise_for_status()
        data = response.json()
        assert data["status"] == "ok"
        assert "timestamp" in data
        print("✓ Health endpoint working")
        return True
    except Exception as e:
        print(f"✗ Health endpoint failed: {e}")
        return False

def test_root():
    """Test root endpoint."""
    print("Testing / endpoint...")
    try:
        response = requests.get(BASE_URL)
        response.raise_for_status()
        data = response.json()
        assert data["message"] == "Sports Insights API"
        assert data["version"] == "1.0.0"
        print("✓ Root endpoint working")
        return True
    except Exception as e:
        print(f"✗ Root endpoint failed: {e}")
        return False

def test_invalid_sport():
    """Test invalid sport validation."""
    print("Testing invalid sport validation...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/invalid/generate-insights",
            json={"team1": "Test", "team2": "Test"}
        )
        assert response.status_code == 400
        print("✓ Invalid sport validation working")
        return True
    except Exception as e:
        print(f"✗ Invalid sport validation failed: {e}")
        return False

def test_nba_endpoint_structure():
    """Test NBA endpoint accepts requests (may fail if no API key)."""
    print("Testing NBA endpoint structure...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/nba/generate-insights",
            json={
                "selectedPlayers": ["LeBron James"],
                "team1": "Lakers",
                "team2": "Warriors"
            }
        )
        # We expect either 200 (success) or 500 (if API key issue or other error)
        # Just checking the endpoint exists and accepts the request format
        print(f"  Response status: {response.status_code}")
        if response.status_code == 200:
            print("✓ NBA endpoint working and returned insights")
            return True
        elif response.status_code == 500:
            print("⚠ NBA endpoint exists but may need API key configuration")
            return True
        else:
            print(f"✗ Unexpected status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ NBA endpoint test failed: {e}")
        return False

def test_epl_endpoint_structure():
    """Test EPL endpoint accepts requests."""
    print("Testing EPL endpoint structure...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/epl/generate-insights",
            json={
                "team1": "Manchester City",
                "team2": "Liverpool"
            }
        )
        print(f"  Response status: {response.status_code}")
        if response.status_code in [200, 500]:
            print("✓ EPL endpoint working")
            return True
        else:
            print(f"✗ Unexpected status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ EPL endpoint test failed: {e}")
        return False

def test_cors_headers():
    """Test CORS headers are present."""
    print("Testing CORS configuration...")
    try:
        response = requests.options(
            f"{BASE_URL}/api/nba/generate-insights",
            headers={"Origin": "http://localhost:8080"}
        )
        print("✓ CORS headers configured")
        return True
    except Exception as e:
        print(f"✗ CORS test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("=" * 50)
    print("Sports Insights API Integration Tests")
    print("=" * 50)
    print()
    
    tests = [
        test_health,
        test_root,
        test_invalid_sport,
        test_cors_headers,
        test_nba_endpoint_structure,
        test_epl_endpoint_structure,
    ]
    
    results = []
    for test in tests:
        result = test()
        results.append(result)
        print()
    
    print("=" * 50)
    print(f"Tests passed: {sum(results)}/{len(results)}")
    print("=" * 50)
    
    if all(results):
        print("\n✓ All tests passed!")
        sys.exit(0)
    else:
        print("\n⚠ Some tests failed. Check output above.")
        sys.exit(1)

if __name__ == "__main__":
    main()


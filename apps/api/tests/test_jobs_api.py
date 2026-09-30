import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["creator"] == "Suraj Jaiswal"

def test_create_and_process_job_flow():
    # 1. Create Job
    payload = {
        "target_language": "hi",
        "explanation_complexity": "standard",
        "guest_session_id": "test-guest-session-123"
    }
    res = client.post("/v1/jobs", json=payload)
    assert res.status_code == 201
    job_data = res.json()
    job_id = job_data["id"]
    assert job_data["status"] == "CREATED"

    # 2. Get Presigned Upload URL
    res = client.post(f"/v1/jobs/{job_id}/upload-url", headers={"X-Guest-Session-Id": "test-guest-session-123"})
    assert res.status_code == 200
    upload_data = res.json()
    assert "upload_url" in upload_data

    # 3. Start Processing Job
    res = client.post(f"/v1/jobs/{job_id}/start", headers={"X-Guest-Session-Id": "test-guest-session-123"})
    assert res.status_code == 200
    assert res.json()["status"] == "COMPLETED"

    # 4. Get Result
    res = client.get(f"/v1/jobs/{job_id}/result", headers={"X-Guest-Session-Id": "test-guest-session-123"})
    assert res.status_code == 200
    result_data = res.json()
    assert "medications" in result_data
    assert "translated_text" in result_data

    # 5. Export PDF
    res = client.get(f"/v1/jobs/{job_id}/export-pdf", headers={"X-Guest-Session-Id": "test-guest-session-123"})
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"

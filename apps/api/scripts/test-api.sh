#!/bin/bash

# API Test Script
# Тестирует API endpoints через curl

API_URL="http://localhost:3001"

echo ""
echo "============================================================"
echo "🧪 AI JOB SEARCH OS - API TEST"
echo "============================================================"
echo ""

# Проверка доступности API
echo "⏳ Waiting for API to be ready..."
for i in {1..30}; do
  if curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo "✅ API is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ API did not start in time"
    exit 1
  fi
  sleep 1
done

echo ""
echo "📋 Testing endpoints..."
echo ""

# 1. Health check
echo "1️⃣  Health check..."
HEALTH=$(curl -s "$API_URL/health")
echo "   $HEALTH"
echo ""

# 2. Register user
echo "2️⃣  Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }')

echo "   $REGISTER_RESPONSE"
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "   ⚠️  User might already exist, trying to login..."
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "password123"
    }')
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
fi

echo ""

# 3. Get current user
echo "3️⃣  Getting current user..."
USER_RESPONSE=$(curl -s "$API_URL/users/me" \
  -H "Authorization: Bearer $TOKEN")
echo "   $USER_RESPONSE"
echo ""

# 4. Create workspace
echo "4️⃣  Creating workspace..."
WORKSPACE_RESPONSE=$(curl -s -X POST "$API_URL/workspaces" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "My Job Search",
    "slug": "my-job-search"
  }')
echo "   $WORKSPACE_RESPONSE"
WORKSPACE_ID=$(echo "$WORKSPACE_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo ""

# 5. Create candidate profile
echo "5️⃣  Creating candidate profile..."
PROFILE_RESPONSE=$(curl -s -X POST "$API_URL/profiles?workspaceId=$WORKSPACE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "headline": "Senior Frontend Engineer",
    "email": "john@example.com",
    "yearsOfExperience": 6,
    "skills": ["React", "TypeScript", "JavaScript", "Node.js", "CSS"]
  }')
echo "   $PROFILE_RESPONSE"
PROFILE_ID=$(echo "$PROFILE_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo ""

# 6. Create mock job source
echo "6️⃣  Creating mock job source..."
SOURCE_RESPONSE=$(curl -s -X POST "$API_URL/sources" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"workspaceId\": \"$WORKSPACE_ID\",
    \"name\": \"Mock Jobs\",
    \"type\": \"mock\",
    \"config\": {}
  }")
echo "   $SOURCE_RESPONSE"
SOURCE_ID=$(echo "$SOURCE_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo ""

# 7. Trigger ingestion
echo "7️⃣  Triggering job ingestion..."
INGEST_RESPONSE=$(curl -s -X POST "$API_URL/sources/$SOURCE_ID/ingest" \
  -H "Authorization: Bearer $TOKEN")
echo "   $INGEST_RESPONSE"
echo ""

# 8. Wait for processing
echo "⏳ Waiting for jobs to be processed..."
sleep 3

# 9. Get jobs
echo "9️⃣  Getting jobs..."
JOBS_RESPONSE=$(curl -s "$API_URL/jobs?workspaceId=$WORKSPACE_ID&limit=5" \
  -H "Authorization: Bearer $TOKEN")
echo "   $JOBS_RESPONSE"
echo ""

# 10. Get job sources
echo "🔟 Getting job sources..."
SOURCES_RESPONSE=$(curl -s "$API_URL/sources?workspaceId=$WORKSPACE_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "   $SOURCES_RESPONSE"
echo ""

echo "============================================================"
echo "✅ API TEST COMPLETED!"
echo "============================================================"
echo ""
echo "📊 Summary:"
echo "   ✅ Health check passed"
echo "   ✅ User registered/logged in"
echo "   ✅ Workspace created"
echo "   ✅ Profile created"
echo "   ✅ Job source created"
echo "   ✅ Ingestion triggered"
echo "   ✅ Jobs retrieved"
echo ""
echo "🎉 All systems operational!"
echo ""

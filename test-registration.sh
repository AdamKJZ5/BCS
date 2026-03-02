#!/bin/bash

echo "🧪 BCS Registration Test Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo -n "Checking if server is running on port 5138... "
if lsof -Pi :5138 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not running${NC}"
    echo ""
    echo "Please start the server first:"
    echo "  cd server && npm run dev"
    exit 1
fi

# Check if client is running
echo -n "Checking if client is running on port 5173... "
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${YELLOW}⚠️  Not running${NC}"
    echo "  To start: cd client && npm run dev"
fi

echo ""
echo "Testing registration endpoint..."
echo ""

# Test registration with curl
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5138/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$(date +%s)'@example.com",
    "password": "Password123",
    "phone": "4255551234"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status Code: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✅ Registration successful!${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    echo ""
    echo -e "${GREEN}Registration is working correctly!${NC}"
    echo ""
    echo "You can now:"
    echo "1. Go to http://localhost:5173/customer/register"
    echo "2. Fill in the form with:"
    echo "   - Name: Your Name"
    echo "   - Email: youremail@test.com"
    echo "   - Password: Password123 (must have uppercase, lowercase, and number)"
    echo "   - Phone: (425) 555-1234"
    echo "3. Click Register"
else
    echo -e "${RED}❌ Registration failed${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    echo ""
    echo "Common issues:"
    echo "1. MongoDB connection error - check MONGO_URI in server/.env"
    echo "2. JWT_SECRET error - check JWT_SECRET in server/.env"
    echo "3. Password validation - must have uppercase, lowercase, number, min 8 chars"
fi

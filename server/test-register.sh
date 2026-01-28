#!/bin/bash
curl -v -X POST http://localhost:5000/api/auth/register \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{"email":"test3@test.com","password":"password123","name":"Test User","phone":"1234567890"}' 2>&1

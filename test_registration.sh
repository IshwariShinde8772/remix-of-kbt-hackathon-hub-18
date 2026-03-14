#!/bin/bash

echo "🔍 Testing Team Registration Edge Function..."
echo ""

# Test data
TEAM_DATA='{
  "team_name": "Test Team Dummy",
  "college_name": "Test Engineering College",
  "institute_number": "TEST123456",
  "leader_name": "Test Leader",
  "leader_email": "ishwarishinde2006@gmail.com",
  "leader_phone": "9876543210",
  "domain": "Software",
  "selected_problem_id": "PS-0001",
  "problem_description": "This is a test problem",
  "members": [
    {"name": "Member 1", "email": "member1@test.com", "contact": "9876543212"},
    {"name": "Member 2", "email": "member2@test.com", "contact": "9876543213"}
  ],
  "mentor_name": "Test Mentor",
  "mentor_email": "mentor@test.com",
  "mentor_contact": "9876543211"
}'

echo "📝 Sending registration data..."
echo "Team: Test Team Dummy"
echo "Email: ishwarishinde2006@gmail.com"
echo ""

curl -X POST https://lxawemydhhmqjahttrlb.supabase.co/functions/v1/register-team \
  -H "Content-Type: application/json" \
  -d "$TEAM_DATA" \
  2>&1

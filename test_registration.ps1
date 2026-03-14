$body = @{
  team_name = 'Test Team Dummy'
  college_name = 'Test Engineering College'
  institute_number = 'TEST123456'
  leader_name = 'Test Leader'
  leader_email = 'ishwarishinde2006@gmail.com'
  leader_phone = '9876543210'
  domain = 'Software'
  selected_problem_id = 'PS-0001'
  problem_description = 'This is a test problem'
  mentor_name = 'Test Mentor'
  mentor_email = 'mentor@test.com'
  mentor_contact = '9876543211'
  members = @(
    @{name = 'Member 1'; email = 'member1@test.com'; contact = '9876543212'},
    @{name = 'Member 2'; email = 'member2@test.com'; contact = '9876543213'}
  )
} | ConvertTo-Json -Depth 5

Write-Host '🔍 Testing Team Registration Edge Function...' -ForegroundColor Cyan
Write-Host 'Calling: https://lxawemydhhmqjahttrlb.supabase.co/functions/v1/register-team' -ForegroundColor Yellow
Write-Host ''

try {
  $headers = @{
    'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXdlbXlkaGhtcWphaHRybGIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxNDc0MjQwMCwiZXhwIjoxNzMwMjk0MDAwfQ.ubKrXr93mZlYr7CkCvpUb0OvWFMgL_yF-N8fLQIYS1k';
    'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXdlbXlkaGhtcWphaHRybGIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxNDc0MjQwMCwiZXhwIjoxNzMwMjk0MDAwfQ.ubKrXr93mZlYr7CkCvpUb0OvWFMgL_yF-N8fLQIYS1k'
  }
  
  $response = Invoke-WebRequest -Uri 'https://lxawemydhhmqjahttrlb.supabase.co/functions/v1/register-team' `
    -Method POST `
    -Body $body `
    -ContentType 'application/json' `
    -Headers $headers `
    -UseBasicParsing `
    -TimeoutSec 30
  
  Write-Host '✅ Status: 200 OK' -ForegroundColor Green
  Write-Host ''
  Write-Host 'Response:' -ForegroundColor Green
  $response.Content | ConvertFrom-Json | ConvertTo-Json | Write-Host
  Write-Host ''
  Write-Host '✅ Registration request successful!' -ForegroundColor Green
  Write-Host '📧 Check ishwarishinde2006@gmail.com for confirmation email' -ForegroundColor Yellow
  
} catch {
  Write-Host '❌ Error:' -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  if ($_.Exception.Response) {
    Write-Host 'Response:' -ForegroundColor Red
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.BaseStream.Position = 0
    $reader.DiscardBufferedData()
    $responseBody = $reader.ReadToEnd()
    Write-Host $responseBody -ForegroundColor Red
  }
}

$headers = @{ "Content-Type" = "application/json" }
$body = '{"task":"SUGGEST_FOLLOWUP","leadId":"LEAD-1001"}'
$res = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/ai/sales-assist" -Method Post -Headers $headers -Body $body
$res | ConvertTo-Json -Depth 5

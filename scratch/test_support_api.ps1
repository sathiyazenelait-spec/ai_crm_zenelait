$headers = @{ "Content-Type" = "application/json" }
$body = '{"ticketId":"TKT-8001","task":"SUGGEST_TROUBLESHOOTING","question":"What troubleshooting steps should I check for a portal login failure?"}'
$res = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/ai/support-assist" -Method Post -Headers $headers -Body $body
$res | ConvertTo-Json -Depth 5

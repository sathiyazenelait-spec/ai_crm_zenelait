# Test Marketing, Analyst, and AI endpoints
$res1 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dashboard/summary?department=MARKETING&period=THIS_MONTH" -Method Get
Write-Host "Marketing Dashboard:" ($res1.success) ($res1.data.leadsGenerated)

$res2 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dashboard/summary?department=ANALYTICS&period=THIS_MONTH" -Method Get
Write-Host "Analyst Dashboard:" ($res2.success) ($res2.data.pipelineValue)

$res3 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/analytics/sales-funnel" -Method Get
Write-Host "Sales Funnel:" ($res3.success) ($res3.data.stages.Count)

$res4 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/marketing/campaigns" -Method Get
Write-Host "Marketing Campaigns:" ($res4.success) ($res4.data.Count)

$bodySales = @{
    channel = "WEBSITE_CHAT"
    visitorId = "VIS-1001"
} | ConvertTo-Json
$res5 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/ai/sales/sessions" -Method Post -ContentType "application/json" -Body $bodySales
Write-Host "AI Sales Session:" ($res5.success) ($res5.data.sessionId)

$bodySup = @{
    channel = "WEBSITE_CHAT"
    customerReference = "CUS-9001"
} | ConvertTo-Json
$res6 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/ai/support/sessions" -Method Post -ContentType "application/json" -Body $bodySup
Write-Host "AI Support Session:" ($res6.success) ($res6.data.sessionId)

$res7 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/ai/follow-up/config" -Method Get
Write-Host "Follow-up Config:" ($res7.success) ($res7.data.defaultTimezone)

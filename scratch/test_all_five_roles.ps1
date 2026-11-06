Write-Host "=== ZENELAIT AI CRM - 5 ROLES TEST ==="

# 1. Marketing Manager
$u1 = 'http://localhost:8080/api/v1/dashboard/summary?department=MARKETING&period=THIS_MONTH'
$m1 = Invoke-RestMethod -Uri $u1 -Method Get
Write-Host "[1/5] Marketing Manager Dashboard:" $m1.success "(Leads:" $m1.data.leadsGenerated "MQLs:" $m1.data.marketingQualifiedLeads ")"

$campBody = @{
    name = "Enterprise Cloud Security Campaign"
    campaignType = "EMAIL"
    objective = "LEAD_GENERATION"
} | ConvertTo-Json
$m2 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/marketing/campaigns" -Method Post -ContentType "application/json" -Body $campBody
Write-Host "[1/5] Create Campaign:" $m2.success "(" $m2.data.campaignId $m2.data.status ")"

$aiDraftBody = @{
    contentType = "EMAIL"
    productOrService = "Custom CRM Development"
} | ConvertTo-Json
$m3 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/marketing/ai/content-draft" -Method Post -ContentType "application/json" -Body $aiDraftBody
Write-Host "[1/5] AI Marketing Content Draft:" $m3.success "(" $m3.data.draftId ")"

# 2. Analyst
$u2 = 'http://localhost:8080/api/v1/dashboard/summary?department=ANALYTICS&period=THIS_MONTH'
$a1 = Invoke-RestMethod -Uri $u2 -Method Get
Write-Host "[2/5] Analyst Dashboard:" $a1.success "(Pipeline: Rs." $a1.data.pipelineValue ")"

$a2 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/analytics/sales-funnel" -Method Get
Write-Host "[2/5] Sales Funnel Analytics:" $a2.success "(Stages:" $a2.data.stages.Count "OppToWon:" $a2.data.opportunityToWonPercent "% )"

$a3 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/reports/RPT-1001/run" -Method Post -ContentType "application/json" -Body "{}"
Write-Host "[2/5] Async Report Run Queued:" $a3.success "(" $a3.data.runId $a3.data.status ")"

# 3. AI Sales Agent
$s1 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/ai/sales/sessions" -Method Post -ContentType "application/json" -Body '{"channel":"WEBSITE_CHAT"}'
Write-Host "[3/5] AI Sales Session Created:" $s1.success "(" $s1.data.sessionId ")"

$sMsg = @{ message = "Looking for a custom CRM with lead tracking" } | ConvertTo-Json
$s2 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/ai/sales/sessions/AIS-1001/messages" -Method Post -ContentType "application/json" -Body $sMsg
Write-Host "[3/5] AI Sales Response Generated:" $s2.success "(" $s2.data.intent ")"

$s3 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/ai/sales/sessions/AIS-1001/qualify" -Method Post -ContentType "application/json" -Body '{"estimatedBudget":500000}'
Write-Host "[3/5] AI Sales BANT Qualification:" $s3.success "(Score:" $s3.data.qualificationScore "/ 100)"

# 4. AI Support Agent
$supMsg = @{ message = "I cannot log in to the portal" } | ConvertTo-Json
$sp1 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/ai/support/sessions/AISUP-1001/messages" -Method Post -ContentType "application/json" -Body $supMsg
Write-Host "[4/5] AI Support Diagnostic Generated:" $sp1.success "(" $sp1.data.issueCategory ")"

$sp2 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/ai/support/sessions/AISUP-1001/troubleshoot" -Method Post -ContentType "application/json" -Body '{"problem":"login failed"}'
Write-Host "[4/5] AI Support Knowledge Troubleshooting:" $sp2.success "(Steps:" $sp2.data.suggestions.Count "Citations:" $sp2.data.sourceArticleIds.Count ")"

# 5. AI Follow-up Agent
$f1 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/ai/follow-up/config" -Method Get
Write-Host "[5/5] AI Follow-up Config:" $f1.success "(Timezone:" $f1.data.defaultTimezone "QuietHours:" $f1.data.respectQuietHours ")"

$fDraft = @{ relatedType = "LEAD"; relatedId = "LEAD-1001"; channel = "EMAIL" } | ConvertTo-Json
$f2 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/ai/follow-up/drafts" -Method Post -ContentType "application/json" -Body $fDraft
Write-Host "[5/5] AI Follow-up Draft Created:" $f2.success "(" $f2.data.draftId $f2.data.status ")"

$fStop = @{ contactId = "CON-2001"; channel = "EMAIL"; reason = "CUSTOMER_OPTOUT" } | ConvertTo-Json
$f3 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/ai/follow-up/stop-contact" -Method Post -ContentType "application/json" -Body $fStop
Write-Host "[5/5] AI Follow-up Contact Suppression Recorded:" $f3.success "(" $f3.data.contactId $f3.data.suppressionStatus ")"

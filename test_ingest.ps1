# PowerShell script to test the /ingest endpoint
$Uri = "http://localhost:8000/ingest"

$Payload = @{
    src_ip = "192.168.1.45"
    dst_ip = "10.0.0.5"
    dst_port = 443
    bytes_out = 320
    status_code = 401
    endpoint = "/api/login"
    failed_logins_1min = 312
    unique_dst_ips_5min = 1
    connection_interval_std = 2.1
    layer = "app"
}

Write-Host "Sending test event to $Uri..." -ForegroundColor Cyan

try {
    $Response = Invoke-RestMethod -Uri $Uri -Method Post -Body ($Payload | ConvertTo-Json) -ContentType "application/json"
    Write-Host "Success! Alert generated:" -ForegroundColor Green
    $Response | ConvertTo-Json
} catch {
    Write-Host "Failed to send event." -ForegroundColor Red
    $_.Exception.Message
}

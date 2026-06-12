# PowerShell Static Web Server for Vintage Photobooth
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8001/")

try {
    $listener.Start()
    Write-Host "======================================================="
    Write-Host "Vintage Photobooth Server Running on http://localhost:8001"
    Write-Host "======================================================="
    Write-Host "Press Ctrl+C in terminal to stop the server."
    Write-Host ""

    # Open the browser automatically
    Start-Process "http://localhost:8001/"
} catch {
    Write-Error "Failed to start server. Port 8001 might already be in use: $_"
    exit
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.RawUrl
        # Default to index.html
        if ($rawUrl -eq "/" -or $rawUrl -eq "") {
            $file = "index.html"
        } else {
            # Trim leading slash and strip query string parameters
            $file = $rawUrl.Split('?')[0].TrimStart('/')
        }

        # Resolve files relative to script directory
        $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
        $filePath = Join-Path $scriptPath $file

        if (Test-Path $filePath -PathType Leaf) {
            # Map extensions to MIME types
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".svg"  { "image/svg+xml; charset=utf-8" }
                ".wav"  { "audio/wav" }
                ".mp3"  { "audio/mpeg" }
                default { "application/octet-stream" }
            }

            $response.ContentType = $contentType
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 File Not Found: $file")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
    } catch {
        # Log error but keep listening
        Write-Host "Request handling error: $_"
    } finally {
        if ($response) {
            $response.Close()
        }
    }
}

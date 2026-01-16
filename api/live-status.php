<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

// CONFIG
$CHANNEL_ID = 'UCgDAnKZngqzL2sJHTI7eUuA';
$CACHE_TTL  = 20; // bajar si querés cortar más rápido al terminar
$UA         = 'Mozilla/5.0 (TelemetricoF1-LiveCheck; +https://www.telemetricof1.com)';
$CACHE_DIR  = __DIR__ . '/cache';
$CACHE_FILE = $CACHE_DIR . '/live_status.json';

if (!is_dir($CACHE_DIR)) { @mkdir($CACHE_DIR, 0755, true); }
$force = isset($_GET['force']) && $_GET['force'] === '1';
$diag  = isset($_GET['diag']) && $_GET['diag'] === '1';

function fetch_page($url, $ua, $follow = false) {
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_HEADER => true,
      CURLOPT_NOBODY => false,
      CURLOPT_FOLLOWLOCATION => $follow ? true : false,
      CURLOPT_USERAGENT => $ua,
      CURLOPT_TIMEOUT => 12,
      CURLOPT_SSL_VERIFYPEER => true,
      CURLOPT_SSL_VERIFYHOST => 2,
      CURLOPT_HTTPHEADER => [
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language: es-ES,es;q=0.9,en;q=0.8',
      ],
    ]);
    $resp = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $hdrSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $headers = substr($resp, 0, $hdrSize);
    $body    = substr($resp, $hdrSize);
    curl_close($ch);
    return [$status, $headers, $body];
  }
  $context = stream_context_create([
    'http' => [
      'method' => 'GET',
      'follow_location' => $follow ? 1 : 0,
      'header' => "User-Agent: $ua\r\nAccept: text/html\r\nAccept-Language: es-ES,es;q=0.9,en;q=0.8\r\n",
      'timeout' => 12
    ]
  ]);
  $body = @file_get_contents($url, false, $context);
  $headers = isset($http_response_header) ? implode("\n", $http_response_header) : '';
  $status = 0;
  if (preg_match('~HTTP/\S+\s+(\d{3})~', $headers, $m)) { $status = (int)$m[1]; }
  return [$status, $headers, $body ?: ''];
}

function extract_player_json($html) {
  if (preg_match('~ytInitialPlayerResponse\s*=\s*(\{.*?\});~s', $html, $m)) {
    $json = $m[1];
    $data = json_decode($json, true);
    if (is_array($data)) return $data;
    $json = html_entity_decode($json, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $data = json_decode($json, true);
    if (is_array($data)) return $data;
  }
  return null;
}

function resolve_channel_live_video_id($channelId, $ua, &$debug = null) {
  $url = "https://www.youtube.com/channel/{$channelId}/live";
  list($status, $headers, $html) = fetch_page($url, $ua, false);

  $vid = null; $src = null;

  if (preg_match('~^Location:\s*(.+)$~im', $headers, $m) && preg_match('~watch\\?v=([A-Za-z0-9_\\-]+)~', $m[1], $mm)) {
    $vid = $mm[1]; $src = 'header:location';
  }
  if (!$vid && preg_match('~property=[\'\"]og:url[\'\"][^>]+content=[\'\"][^\'\"]*watch\\?v=([A-Za-z0-9_\\-]+)~i', $html, $m)) {
    $vid = $m[1]; $src = 'meta:og:url';
  }
  if (!$vid && preg_match('~rel=[\'\"]canonical[\'\"][^>]+href=[\'\"][^\'\"]*watch\\?v=([A-Za-z0-9_\\-]+)~i', $html, $m)) {
    $vid = $m[1]; $src = 'link:canonical';
  }
  if (!$vid && preg_match('~watch\\?v=([A-Za-z0-9_\\-]+)~', $html, $m)) {
    $vid = $m[1]; $src = 'html:watch-any';
  }

  if (is_array($debug)) $debug['resolve'] = ['status' => $status, 'source' => $src, 'videoId' => $vid];
  return $vid;
}

function decide_is_live_now($videoId, $ua, &$debug = null) {
  if (!$videoId) return [false, 'no-videoId'];
  $watchUrl = "https://www.youtube.com/watch?v={$videoId}";
  list($st, $hdr, $body) = fetch_page($watchUrl, $ua, true);

  $ipr = extract_player_json($body);
  $reason = 'no-ipr';

  // Señales tolerantes:
  // a) microformat.liveBroadcastDetails.broadcastStatus === "live"
  // b) microformat.liveBroadcastDetails.isLiveNow === true
  // c) videoDetails.isLiveContent === true Y player ok
  // d) HTML con isLiveNow:true
  $isLive = false;

  if ($ipr) {
    $micro    = $ipr['microformat']['playerMicroformatRenderer'] ?? [];
    $details  = $ipr['videoDetails'] ?? [];
    $playStat = $ipr['playabilityStatus']['status'] ?? null; // 'OK' si reproducible
    $broadcastStatus = $micro['liveBroadcastDetails']['broadcastStatus'] ?? null; // live | complete | none
    $isLiveNowMicro  = $micro['liveBroadcastDetails']['isLiveNow'] ?? null;
    $isLiveContent   = $details['isLiveContent'] ?? null;
    $hasHls          = isset(($ipr['streamingData'] ?? [])['hlsManifestUrl']); // a veces no aparece aunque esté live

    if ($broadcastStatus === 'live' || $isLiveNowMicro === true) {
      if ($playStat === 'OK') { $isLive = true; $reason = 'broadcastStatus/live'; }
      elseif ($hasHls)       { $isLive = true; $reason = 'hls-live'; }
      elseif ($isLiveContent){ $isLive = true; $reason = 'isLiveContent'; }
      else { $reason = 'status-live-but-not-ok'; }
    } else {
      $reason = 'broadcastStatus=' . ($broadcastStatus ?? 'null');
    }
    if (is_array($debug)) $debug['ipr'] = [
      'playabilityStatus' => $playStat,
      'broadcastStatus'   => $broadcastStatus,
      'isLiveNowMicro'    => $isLiveNowMicro,
      'isLiveContent'     => $isLiveContent,
      'hasHls'            => $hasHls
    ];
  } else {
    if (preg_match('~"isLiveNow"\s*:\s*true~i', $body)) { $isLive = true; $reason = 'html:isLiveNow'; }
  }

  if (is_array($debug)) $debug['watch'] = ['status' => $st, 'reason' => $reason];
  return [$isLive, $reason];
}

// ---------- CACHE ----------
if (!$force && file_exists($CACHE_FILE)) {
  $age = time() - filemtime($CACHE_FILE);
  if ($age < $CACHE_TTL) {
    header('X-Cache: HIT; age='.$age);
    readfile($CACHE_FILE);
    exit;
  }
}

// ---------- RESOLVER + DECIDIR ----------
$debug = [];
$candidate = resolve_channel_live_video_id($CHANNEL_ID, $UA, $debug);
list($liveNow, $reason) = decide_is_live_now($candidate, $UA, $debug);

// ---------- PAYLOAD ----------
$payload = [
  'live'            => $liveNow,
  'videoId'         => $liveNow ? $candidate : null,
  'embedUrl'        => $liveNow && $candidate ? "https://www.youtube.com/embed/{$candidate}" : null,
  'candidateVideoId'=> $candidate,      // <— útil para debug/front
  'reason'          => $reason,         // <— por qué dio true/false
  'ts'              => time()
];

if ($diag) {
  $payload['debug'] = $debug; // ¡sólo en diag!
}

// ---------- GUARDAR CACHE ----------
$json = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
file_put_contents($CACHE_FILE.'.tmp', $json, LOCK_EX);
@rename($CACHE_FILE.'.tmp', $CACHE_FILE);

header('X-Cache: MISS');
echo $json;

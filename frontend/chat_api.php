<?php
// CORSヘッダーを設定
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// 設定
// ↓ 自分のgeminiのAPIキー(Google AI StudioでAPIキーを取得)
$gemini_api_key = 'AIzaSyArl9NmO78fBisVQKzNvYelsnqMJhSalKw';
$history_file = 'chat_history.json';

// 履歴ファイルが存在しないか、中身が空の場合
// JSON配列([])で初期化
if (!file_exists($history_file) || filesize($history_file) === 0) {
    file_put_contents($history_file, json_encode([]));
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';


if ($action === 'get_history') {
    header('Content-Type: application/json');
    // ファイルの内容をそのまま返す
    echo file_get_contents($history_file);
} elseif ($action === 'send_message') {
    $user_message = $input['message'] ?? '';

    // json_decodeが失敗した場合、デフォルトで空の配列を使用
    $current_history = json_decode(file_get_contents($history_file), true) ?? [];

    if (empty($user_message)) {
        http_response_code(400);
        echo json_encode(['error' => 'Message is empty']);
        exit;
    }

    $contents_for_api = [];

    foreach ($current_history as $entry) {
        $contents_for_api[] = ['role' => 'user', 'parts' => [['text' => $entry['user']]]];
        $contents_for_api[] = ['role' => 'model', 'parts' => [['text' => $entry['assistant']]]];
    }
    $contents_for_api[] = ['role' => 'user', 'parts' => [['text' => $user_message]]];

    // ↓ 最新の推奨モデルに
    $api_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' . $gemini_api_key;

    $payload = json_encode(['contents' => $contents_for_api]);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpcode != 200) {
        http_response_code(500);
        // エラー内容をJSONで返す
        echo json_encode(['error' => 'Gemini API Error', 'details' => json_decode($response)]);
        exit;
    }

    $result = json_decode($response, true);
    $assistant_message = $result['candidates'][0]['content']['parts'][0]['text'] ?? 'エラー：応答がありませんでした。';

    $current_history[] = [
        'user' => $user_message,
        'assistant' => $assistant_message,
        'timestamp' => time()
    ];

    file_put_contents($history_file, json_encode($current_history, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    header('Content-Type: application/json');
    echo json_encode(['reply' => $assistant_message]);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid action or action not specified']);
}

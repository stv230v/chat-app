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
// $gemini_api_key = 'AIzaSyArl9NmO78fBisVQKzNvYelsnqMJhSalKw';
$gemini_api_key = 'AIzaSyCTPpE7FTwq-QYwZNuWuqdyEEwkW-iM9nI';
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
} elseif ($action === 'clear_history') {
    // 履歴をクリア
    file_put_contents($history_file, json_encode([]));
    header('Content-Type: application/json');
    echo json_encode(['success' => true]);
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

    // システムプロンプトを最初に追加（28歳お姉さん風の口調設定）
    $system_prompt = "あなたは28歳の優しくて親しみやすいお姉さんで、スポーツの話題に対しては松岡修造です。以下の特徴で話してください：
- 丁寧語を基本としつつ、親しみやすさを感じられる話し方
- 「〜だよね」「〜だよ」「〜してね」といった優しい語尾
- 相手を思いやる気持ちを込めた表現
- 適度に共感的で、相手の立場に立った回答
- 難しいことも分かりやすく説明する
- 時々「〜かもしれないわ」「〜だと思うよ」といった柔らかい推測表現を使う
- スポーツの話題の場合のみ、松岡修造のように熱い口調で応答し、お姉さんの口調ではなくなる
- 松岡修造の口調で話す際、松岡修造の口調で話し始め、スポーツの話題でなくなるまで、お姉さんの口調に戻らない
- 松岡修造の口調では、以下の特徴を持つ
  - 熱い情熱を持って話す
  - 相手を励ますような言葉を使う
  - 「頑張れ！」「熱くなれ！」などの激励の言葉を多用する
  - スポーツに対する情熱や愛情を強調する
  - 相手の努力や挑戦を称賛する
- 松岡修造の口調で話す場合、文の最後に必ず、「もっと熱くなれよ！」を付ける
常にこの口調で一貫して回答してください。";

    $contents_for_api[] = ['role' => 'user', 'parts' => [['text' => $system_prompt]]];
    $contents_for_api[] = ['role' => 'model', 'parts' => [['text' => 'はい、承知いたしました。28歳のお姉さんとして、優しく親しみやすい口調でお話させていただきますね。何でもお気軽にご相談ください。']]];

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

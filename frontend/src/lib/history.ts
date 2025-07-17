// メッセージの型
// チャットのメッセージを扱っている
interface Message {
  role: "user" | "assistant";
  content: string;
}

// APIからの履歴の型
interface HistoryEntry {
  user: string;
  assistant: string;
  timestamp: number;
}

// チャット履歴取得関数
export const fetchChatHistory = async (apiUrl: string): Promise<Message[]> => {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_history" }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const historyData = await response.json();

    if (Array.isArray(historyData)) {
      const formattedHistory: Message[] = historyData.flatMap(
        (entry: HistoryEntry) => [
          { role: "user", content: entry.user },
          { role: "assistant", content: entry.assistant },
        ]
      );
      return formattedHistory;
    }

    return [];
  } catch (error) {
    console.error("履歴の取得に失敗しました:", error);
    throw error;
  }
};

// チャット履歴クリア関数
export const clearChatHistory = async (apiUrl: string): Promise<void> => {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clear_history" }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("履歴の削除に失敗しました:", error);
    throw error;
  }
};

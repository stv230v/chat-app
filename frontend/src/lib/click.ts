import { clearChatHistory } from "./history";

// メッセージの型を定義
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UseMessageSubmitProps {
  // カスタムフックを作成
  // useStateの型定義をそれぞれしている
  input: string;
  setInput: (value: string) => void;
  chat: Message[];
  setChat: (value: Message[] | ((prev: Message[]) => Message[])) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  apiUrl: string;
}

export const useMessageSubmit = ({
  input,
  setInput,
  chat,
  setChat,
  isLoading,
  setIsLoading,
  apiUrl,
}: UseMessageSubmitProps) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // 初期動作のキャンセル (e.preventDefault())
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };

    // UIへの反映
    const newMessages = [...chat, userMessage];
    setChat(newMessages);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // fetchの宛先をphpに変更する
      // 送信データを変更
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          message: currentInput,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `APIリクエストが失敗しました。ステータス: ${response.status}, 本文: ${errorBody}`
        );
      }

      const result = await response.json();
      // PHPからの返信を取得
      const assistantMessage: Message = {
        role: "assistant",
        content: result.reply,
      };

      // AIの応答を、PHPから返ってくる確定した値で更新
      setChat((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("API呼び出しエラー:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "エラーが発生しました。PHPサーバーとの通信を確認してください。",
      };

      // ユーザーのメッセージを一旦削除
      setChat((prev) => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSubmit };
};

// カスタムフックでチャットリセットを作成
interface UseResetChatProps {
  setChat: (value: Message[] | ((prev: Message[]) => Message[])) => void;
  apiUrl: string;
}

export const useResetChat = ({ setChat, apiUrl }: UseResetChatProps) => {
  const handleReset = async () => {
    try {
      await clearChatHistory(apiUrl);
      setChat([]);
    } catch (error) {
      console.error("履歴の削除に失敗しました:", error);
    }
  };

  return { handleReset };
};

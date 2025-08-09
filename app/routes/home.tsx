import { useState } from "react";
import { ChatSidebar } from "~/components/ChatSidebar";
import { ChatSpace } from "~/components/ChatSpace";
import { MobileSidebar } from "~/components/MobileSidebar";
import type { Route } from "./+types/home";

export function meta() {
  return [
    { title: "LLM Chat App" },
    { name: "description", content: "Chat with various LLM models" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE };
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | undefined>();
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [isLoading, setIsLoading] = useState(false);

  const currentChat = chats.find(chat => chat.id === activeChat);
  const messages = currentChat?.messages || [];

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      title: "新しいチャット",
      timestamp: new Date(),
      messages: [],
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChatId);
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChat === chatId) {
      setActiveChat(undefined);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeChat) {
      handleNewChat();
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      content,
      role: "user",
      timestamp: new Date(),
    };

    setChats(prev => prev.map(chat => 
      chat.id === activeChat 
        ? { 
            ...chat, 
            messages: [...chat.messages, userMessage],
            title: chat.messages.length === 0 ? content.slice(0, 50) : chat.title
          }
        : chat
    ));

    setIsLoading(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        content: `これは${selectedModel}からの模擬回答です。実際のLLMとの連携はまだ実装されていません。\n\nあなたのメッセージ: "${content}"`,
        role: "assistant",
        timestamp: new Date(),
      };

      setChats(prev => prev.map(chat => 
        chat.id === activeChat 
          ? { ...chat, messages: [...chat.messages, assistantMessage] }
          : chat
      ));

      setIsLoading(false);
    }, 1500);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
        />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar
        chats={chats}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />

      <ChatSpace
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
      />
    </div>
  );
}

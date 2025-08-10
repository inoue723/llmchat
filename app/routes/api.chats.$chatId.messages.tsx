import type { Route } from "./+types/api.chats.$chatId.messages";
import { ChatService } from "../services/chatService";

export async function loader({ params, context }: Route.LoaderArgs) {
  try {
    const { chatId } = params;
    const chatService = new ChatService(context.cloudflare.env.DB);
    
    // Verify chat exists
    const chat = await chatService.getChatById(chatId);
    if (!chat) {
      return Response.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    const messages = await chatService.getChatMessages(chatId);
    
    return Response.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function action({ request, params, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json(
      { success: false, error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    const { chatId } = params;
    const formData = await request.formData();
    const role = formData.get("role") as string;
    const content = formData.get("content") as string;

    if (!role || !content || !["user", "assistant", "system"].includes(role)) {
      return Response.json(
        { success: false, error: "Valid role and content are required" },
        { status: 400 }
      );
    }

    const chatService = new ChatService(context.cloudflare.env.DB);
    
    // Verify chat exists
    const chat = await chatService.getChatById(chatId);
    if (!chat) {
      return Response.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    const message = await chatService.addMessage({
      chatId,
      role: role as "user" | "assistant" | "system",
      content: content.trim(),
    });

    return Response.json({ success: true, data: message });
  } catch (error) {
    console.error("Error creating message:", error);
    return Response.json(
      { success: false, error: "Failed to create message" },
      { status: 500 }
    );
  }
}
import type { Route } from "./+types/api.chats.$chatId";
import { ChatService } from "../services/chatService";

export async function loader({ params, context }: Route.LoaderArgs) {
  try {
    const { chatId } = params;
    const chatService = new ChatService(context.cloudflare.env.DB);
    
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
      data: { chat, messages }
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return Response.json(
      { success: false, error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const { chatId } = params;
  
  if (request.method === "PUT") {
    try {
      const formData = await request.formData();
      const title = formData.get("title") as string;

      if (!title || title.trim() === "") {
        return Response.json(
          { success: false, error: "Chat title is required" },
          { status: 400 }
        );
      }

      const chatService = new ChatService(context.cloudflare.env.DB);
      const updatedChat = await chatService.updateChat(chatId, { title: title.trim() });

      if (!updatedChat) {
        return Response.json(
          { success: false, error: "Chat not found" },
          { status: 404 }
        );
      }

      return Response.json({ success: true, data: updatedChat });
    } catch (error) {
      console.error("Error updating chat:", error);
      return Response.json(
        { success: false, error: "Failed to update chat" },
        { status: 500 }
      );
    }
  }

  if (request.method === "DELETE") {
    try {
      const chatService = new ChatService(context.cloudflare.env.DB);
      const deleted = await chatService.deleteChat(chatId);

      if (!deleted) {
        return Response.json(
          { success: false, error: "Chat not found" },
          { status: 404 }
        );
      }

      return Response.json({ success: true, data: { deleted: true } });
    } catch (error) {
      console.error("Error deleting chat:", error);
      return Response.json(
        { success: false, error: "Failed to delete chat" },
        { status: 500 }
      );
    }
  }

  return Response.json(
    { success: false, error: "Method not allowed" },
    { status: 405 }
  );
}
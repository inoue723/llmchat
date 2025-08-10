import type { Route } from "./+types/api.chats";
import { ChatService } from "../services/chatService";

export async function loader({ context }: Route.LoaderArgs) {
  try {
    const chatService = new ChatService(context.cloudflare.env.DB);
    const chats = await chatService.getAllChats();
    
    return Response.json({ success: true, data: chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return Response.json(
      { success: false, error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json(
      { success: false, error: "Method not allowed" },
      { status: 405 }
    );
  }

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
    const chat = await chatService.createChat({ title: title.trim() });

    return Response.json({ success: true, data: chat });
  } catch (error) {
    console.error("Error creating chat:", error);
    return Response.json(
      { success: false, error: "Failed to create chat" },
      { status: 500 }
    );
  }
}
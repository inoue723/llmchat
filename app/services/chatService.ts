import { eq, desc } from "drizzle-orm";
import { createDbClient, type DbClient } from "../db/client";
import { chats, messages, type Chat, type NewChat, type Message, type NewMessage } from "../db/schema";
import { generateId } from "../lib/utils";

export class ChatService {
  private db: DbClient;

  constructor(d1Database: D1Database) {
    this.db = createDbClient(d1Database);
  }

  async createChat(data: Omit<NewChat, "id">): Promise<Chat> {
    const id = generateId();
    const newChat: NewChat = { ...data, id };
    
    const [chat] = await this.db.insert(chats).values(newChat).returning();
    return chat;
  }

  async getChatById(id: string): Promise<Chat | null> {
    const [chat] = await this.db.select().from(chats).where(eq(chats.id, id)).limit(1);
    return chat || null;
  }

  async getAllChats(): Promise<Chat[]> {
    return await this.db.select().from(chats).orderBy(desc(chats.updatedAt));
  }

  async updateChat(id: string, data: Partial<Omit<NewChat, "id">>): Promise<Chat | null> {
    const [updatedChat] = await this.db
      .update(chats)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(chats.id, id))
      .returning();
    
    return updatedChat || null;
  }

  async deleteChat(id: string): Promise<boolean> {
    const result = await this.db.delete(chats).where(eq(chats.id, id));
    return (result as any).changes > 0;
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    return await this.db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt);
  }

  async addMessage(data: Omit<NewMessage, "id">): Promise<Message> {
    const id = generateId();
    const newMessage: NewMessage = { ...data, id };
    
    const [message] = await this.db.insert(messages).values(newMessage).returning();
    
    // Update chat's updatedAt timestamp
    await this.db
      .update(chats)
      .set({ updatedAt: new Date() })
      .where(eq(chats.id, data.chatId));
    
    return message;
  }

  async getMessageById(id: string): Promise<Message | null> {
    const [message] = await this.db.select().from(messages).where(eq(messages.id, id)).limit(1);
    return message || null;
  }

  async updateMessage(id: string, data: Partial<Omit<NewMessage, "id" | "chatId">>): Promise<Message | null> {
    const [updatedMessage] = await this.db
      .update(messages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(messages.id, id))
      .returning();
    
    return updatedMessage || null;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const result = await this.db.delete(messages).where(eq(messages.id, id));
    return (result as any).changes > 0;
  }
}
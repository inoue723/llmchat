import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("chats/:chatId/send", "routes/chats.$chatId.send.tsx"),
  route("api/chats", "routes/api.chats.tsx"),
  route("api/chats/:chatId", "routes/api.chats.$chatId.tsx"),
  route("api/chats/:chatId/messages", "routes/api.chats.$chatId.messages.tsx"),
] satisfies RouteConfig;

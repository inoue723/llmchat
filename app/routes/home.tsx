import { useTheme } from "next-themes";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/home";

export function meta() {
  return [
    { title: "LLM Chat App" },
    { name: "description", content: "Chat with verious LLM models" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE };
}

const ThemeChanger = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      The current theme is: {theme}
      <Button className="bg-primary" onClick={() => setTheme("light")}>
        Light Mode
      </Button>
      <Button className="bg-primary" onClick={() => setTheme("dark")}>
        Dark Mode
      </Button>
    </div>
  );
};

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <ThemeChanger />
    </div>
  );
}

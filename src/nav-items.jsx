import { ListTodo } from "lucide-react";
import Index from "./pages/Index.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Tasks",
    to: "/",
    icon: <ListTodo className="h-4 w-4" />,
    page: <Index />,
  },
];

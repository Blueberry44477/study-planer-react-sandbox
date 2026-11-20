import type Task from "../types/task.ts";

const initialTasks: Task[] = [
  {
    id: 1,
    title: "React Components",
    description: "Опрацювати базові принципи компонентів React",
    completed: false,
    priority: "high",
    category: "React",
  },
  {
    id: 2,
    title: "TypeScript Exercises",
    description: "Виконати практичні вправи",
    completed: true,
    priority: "medium",
    category: "TypeScript",
  },
];

export function getInitialTasks(): Task[] {
  return initialTasks.map((task) => ({ ...task }));
}

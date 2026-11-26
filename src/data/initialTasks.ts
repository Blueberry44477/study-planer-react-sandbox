import type Task from "../types/task.ts";

const initialTasks: Task[] = [
  {
    id: 1,
    title: "React Components",
    description: "Опрацювати базові принципи компонентів React",
    completed: false,
    priority: "high",
    category: "React",
    createdBy: "emilys",
    createdAt: "2026-11-20T09:00:00.000Z",
  },
  {
    id: 2,
    title: "TypeScript Exercises",
    description: "Виконати практичні вправи",
    completed: true,
    priority: "medium",
    category: "TypeScript",
    createdBy: "emilys",
    createdAt: "2026-11-20T10:00:00.000Z",
  },
];

export function getInitialTasks(): Task[] {
  return initialTasks.map((task) => ({ ...task }));
}

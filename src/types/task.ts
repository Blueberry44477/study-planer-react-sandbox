export type TaskPriority = 'low' | 'medium' | 'high';

export default interface Task {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    priority: TaskPriority;
    category: string;
    // Client-owned metadata (not provided by DummyJSON /todos API)
    createdBy: string;
    createdAt: string;
}
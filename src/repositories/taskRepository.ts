import { httpClient } from '../api/httpClient.ts';
import type Task from '../types/task.ts';
import type { TaskPriority } from '../types';

const DEFAULT_USER_ID = 1;
const DEFAULT_PRIORITY: TaskPriority = 'medium';
const DEFAULT_CATEGORY = 'General';

interface ApiTodo {
    id: number;
    todo: string;
    completed: boolean;
    userId: number;
}

interface TodosResponse {
    todos: ApiTodo[];
    total: number;
    skip: number;
    limit: number;
}

interface DeleteTodoResponse extends ApiTodo {
    isDeleted?: boolean;
    deletedOn?: string;
}

export interface GetTasksParams {
    limit?: number;
    skip?: number;
}

export interface TaskListResult {
    tasks: Task[];
    total: number;
    skip: number;
    limit: number;
}

export interface CreateTaskInput {
    title: string;
    completed?: boolean;
    description?: string;
    priority?: TaskPriority;
    category?: string;
    createdBy?: string;
    createdAt?: string;
}

export interface UpdateTaskInput {
    title?: string;
    completed?: boolean;
    description?: string;
    priority?: TaskPriority;
    category?: string;
}

function toTask(
    todo: ApiTodo,
    clientMetadata?: {
        description?: string;
        priority?: TaskPriority;
        category?: string;
        createdBy?: string;
        createdAt?: string;
    },
): Task {
    return {
        id: todo.id,
        title: todo.todo,
        description: clientMetadata?.description ?? '',
        completed: todo.completed,
        priority: clientMetadata?.priority ?? DEFAULT_PRIORITY,
        category: clientMetadata?.category ?? DEFAULT_CATEGORY,
        // Client-owned metadata: DummyJSON /todos does not provide author or creation timestamp
        createdBy: clientMetadata?.createdBy ?? `User #${todo.userId}`,
        createdAt: clientMetadata?.createdAt ?? new Date().toISOString(),
    };
}

export const taskRepository = {
    async getAll(params: GetTasksParams = {}, signal?: AbortSignal): Promise<TaskListResult> {
        const response = await httpClient.get<TodosResponse>('/todos', {
            params: {
                limit: params.limit,
                skip: params.skip,
            },
            signal,
        });

        return {
            tasks: response.todos.map((todo) => toTask(todo)),
            total: response.total,
            skip: response.skip,
            limit: response.limit,
        };
    },

    async getById(id: number, signal?: AbortSignal): Promise<Task> {
        const todo = await httpClient.get<ApiTodo>(`/todos/${id}`, { signal });
        return toTask(todo);
    },

    async create(task: CreateTaskInput): Promise<Task> {
        const created = await httpClient.post<ApiTodo>(
            '/todos/add',
            {
                todo: task.title,
                completed: task.completed ?? false,
                userId: DEFAULT_USER_ID,
            },
            { requiresAuth: true },
        );

        return toTask(created, {
            description: task.description,
            priority: task.priority,
            category: task.category,
            createdBy: task.createdBy,
            createdAt: task.createdAt,
        });
    },

    async update(id: number, task: UpdateTaskInput): Promise<Task> {
        const payload: { todo?: string; completed?: boolean } = {};
        if (task.title !== undefined) {
            payload.todo = task.title;
        }
        if (task.completed !== undefined) {
            payload.completed = task.completed;
        }

        const updated = await httpClient.patch<ApiTodo>(`/todos/${id}`, payload, {
            requiresAuth: true,
        });

        return toTask(updated, {
            description: task.description,
            priority: task.priority,
            category: task.category,
        });
    },

    async delete(id: number): Promise<void> {
        await httpClient.delete<DeleteTodoResponse>(`/todos/${id}`, {
            requiresAuth: true,
        });
    },
};

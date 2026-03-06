const TICKTICK_API_BASE = "https://api.ticktick.com/open/v1";

interface TickTickTask {
  id?: string;
  title: string;
  content?: string;
  priority?: number;
  dueDate?: string;
  startDate?: string;
  isAllDay?: boolean;
  status?: number;
  projectId?: string;
}

interface TickTickProject {
  id: string;
  name: string;
  color?: string;
}

async function tickTickFetch(
  accessToken: string,
  path: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${TICKTICK_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(
      `TickTick API error: ${res.status} ${res.statusText} - ${errorText}`
    );
  }

  if (res.status === 204) return null;
  return res.json();
}

export const tickTickService = {
  // ==================== Projects ====================
  async getProjects(accessToken: string): Promise<TickTickProject[]> {
    return tickTickFetch(accessToken, "/project");
  },

  // ==================== Tasks ====================
  async getTask(
    accessToken: string,
    projectId: string,
    taskId: string
  ): Promise<TickTickTask> {
    return tickTickFetch(accessToken, `/project/${projectId}/task/${taskId}`);
  },

  async createTask(
    accessToken: string,
    task: TickTickTask
  ): Promise<TickTickTask> {
    return tickTickFetch(accessToken, "/task", {
      method: "POST",
      body: JSON.stringify(task),
    });
  },

  async updateTask(
    accessToken: string,
    taskId: string,
    task: Partial<TickTickTask>
  ): Promise<TickTickTask> {
    return tickTickFetch(accessToken, `/task/${taskId}`, {
      method: "POST",
      body: JSON.stringify({ ...task, id: taskId }),
    });
  },

  async completeTask(
    accessToken: string,
    projectId: string,
    taskId: string
  ): Promise<void> {
    await tickTickFetch(
      accessToken,
      `/project/${projectId}/task/${taskId}/complete`,
      { method: "POST" }
    );
  },

  async deleteTask(
    accessToken: string,
    projectId: string,
    taskId: string
  ): Promise<void> {
    await tickTickFetch(
      accessToken,
      `/project/${projectId}/task/${taskId}`,
      { method: "DELETE" }
    );
  },

  // ==================== OAuth ====================
  getAuthUrl(clientId: string, redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "tasks:read tasks:write",
      state,
    });
    return `https://ticktick.com/oauth/authorize?${params.toString()}`;
  },

  async exchangeToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<{ access_token: string; token_type: string }> {
    const res = await fetch("https://ticktick.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) {
      throw new Error(`Token exchange failed: ${res.status}`);
    }

    return res.json();
  },
};

// ==================== DTO Mapping ====================
export interface TaskDTO {
  id: string;
  title: string;
  content?: string;
  priority: number;
  dueDate?: string;
  status: "todo" | "in_progress" | "done";
  projectId?: string;
  source: "ticktick";
}

export function mapTickTickTaskToDTO(task: TickTickTask): TaskDTO {
  return {
    id: task.id || "",
    title: task.title,
    content: task.content,
    priority: task.priority || 0,
    dueDate: task.dueDate,
    status: task.status === 2 ? "done" : task.status === 1 ? "in_progress" : "todo",
    projectId: task.projectId,
    source: "ticktick",
  };
}

export interface CalendarEventDTO {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  isAllDay: boolean;
  source: "ticktick";
}

export function mapTickTickTaskToCalendarEvent(
  task: TickTickTask
): CalendarEventDTO | null {
  if (!task.startDate && !task.dueDate) return null;
  return {
    id: task.id || "",
    title: task.title,
    startDate: task.startDate || task.dueDate || "",
    endDate: task.dueDate,
    isAllDay: task.isAllDay || false,
    source: "ticktick",
  };
}

export type Task = (prompt: string) => Promise<string>;
export type Verification = (prompt: string, response: string) => Promise<boolean>;

export interface DueyOptions {
  maxRetries?: number;
}

/**
 * Duey executes a task and verifies the response using a pluggable
 * verification callback. It retries the task until verification succeeds or
 * the configured retry limit is exceeded.
 */
export class Duey {
  private maxRetries: number;

  constructor(private task: Task, private verify: Verification, options: DueyOptions = {}) {
    this.maxRetries = options.maxRetries ?? 3;
  }

  async run(prompt: string): Promise<string> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      const response = await this.task(prompt);
      const valid = await this.verify(prompt, response);
      if (valid) return response;
    }
    throw new Error(`Verification failed after ${this.maxRetries} attempts`);
  }
}

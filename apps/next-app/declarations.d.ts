declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    JWT_SECRET?: string;
    NEXT_PUBLIC_BACKEND_URL?: string;
    NEXT_BACKEND_URL?: string;
    NEXTAUTH_SECRET?: string;
    NEXTAUTH_URL?: string;
  }

  interface Process {
    cwd: () => string;
    env: ProcessEnv;
  }
}

declare module '@socket' {
  export const socket: any;
}

// глобальная переменная process
declare var process: NodeJS.Process;

declare module '*.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.scss' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.json' {
  const value: Record<string, unknown>;
  export default value;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.svg?url' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

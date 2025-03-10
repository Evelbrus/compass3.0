declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_URL: string;
    NEXT_PUBLIC_SOCKET_ORIGIN: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    ENCRYPTION_KEY: string;
    RATE_LIMIT_MAX_ATTEMPTS: string;
    WEBSOCKET_PORT: number;
    REDIS_HOST: string;
    REDIS_PORT: string;
    DATABASE_URL: string;
    NEXT_PUBLIC_YANDEX_MAPS_API_KEY: string;
  }

  interface Process {
    cwd: () => string;
    env: ProcessEnv;
  }
}

//глобальная переменная process
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

// @next-app/src/interface/interface.ts

// Обновленный интерфейс Params, который наследуется от Promise
export interface Params extends Promise<{ uuid: string }> {
  uuid: string;
}
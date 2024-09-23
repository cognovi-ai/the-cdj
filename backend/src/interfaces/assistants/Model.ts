import { Permission } from './Permission.js';

export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: Permission[];
  root: string;
  parent?: string | null;
}

export interface ModelsResponse {
  object: string;
  data: Model[];
}
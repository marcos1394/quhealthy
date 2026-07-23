import { BaseWidget } from './widgets';
import { HealthOSIntent } from './intents';

export interface HealthOSResponse {
  id: string; // Unique response ID
  timestamp: string;
  intent?: HealthOSIntent; // The classified intent, if any
  text?: string; // Conversational text from the AI
  widgets?: BaseWidget[]; // The sequence of widgets to render
  isComplete: boolean; // For streaming: false if more chunks are coming
}

export * from './actions';
export * from './intents';
export * from './widgets';

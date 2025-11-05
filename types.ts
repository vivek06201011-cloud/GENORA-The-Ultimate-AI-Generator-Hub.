
import React from 'react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  prompt: (input: string, secondaryInput?: string) => string;
  model: 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.5-pro';
  isComplex?: boolean;
  useSearch?: boolean;
  needsSecondaryInput?: boolean;
  secondaryInputLabel?: string;
  secondaryInputPlaceholder?: string;
}

export interface ToolState {
  input: string;
  secondaryInput?: string;
  output: string;
  history: HistoryItem[];
}

export interface HistoryItem {
  id: string;
  text: string;
}

export interface Review {
  name: string;
  avatar: string;
  rating: number;
  text: string;
}

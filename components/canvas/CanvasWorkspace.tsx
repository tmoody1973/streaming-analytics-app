"use client";

import { Tldraw, Editor } from 'tldraw';
import 'tldraw/tldraw.css';
import { C1CardShapeUtil } from './C1CardShape';

const customShapeUtils = [C1CardShapeUtil];

interface CanvasWorkspaceProps {
  onMount?: (editor: Editor) => void;
}

export function CanvasWorkspace({ onMount }: CanvasWorkspaceProps) {
  return (
    <div className="w-full h-full">
      <Tldraw
        shapeUtils={customShapeUtils}
        onMount={onMount}
      />
    </div>
  );
}

// Helper function to create a C1 card on the canvas
export function createC1Card(
  editor: Editor,
  options: {
    prompt: string;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
  }
) {
  const { prompt, x = 100, y = 100, w = 600, h = 400 } = options;

  editor.createShapes([
    {
      type: 'c1Card',
      x,
      y,
      props: {
        w,
        h,
        prompt,
        response: '',
      },
    },
  ]);
}

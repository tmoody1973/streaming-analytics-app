"use client";

import { useState, useEffect } from 'react';
import {
  BaseBoxShapeUtil,
  HTMLContainer,
  TLBaseShape,
  T,
  Rectangle2d,
  useEditor,
} from 'tldraw';
import { C1Component, ThemeProvider } from '@thesysai/genui-sdk';
import '@crayonai/react-ui/styles/index.css';

// Define the C1 card shape type
export type C1CardShape = TLBaseShape<
  'c1Card',
  {
    w: number;
    h: number;
    prompt: string;
    response?: string;
  }
>;

// Create the shape util
export class C1CardShapeUtil extends BaseBoxShapeUtil<C1CardShape> {
  static override type = 'c1Card' as const;

  static override props = {
    w: T.number,
    h: T.number,
    prompt: T.string,
    response: T.string,
  };

  getDefaultProps(): C1CardShape['props'] {
    return {
      w: 600,
      h: 400,
      prompt: '',
      response: '',
    };
  }

  override getGeometry(shape: C1CardShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  override component(shape: C1CardShape) {
    return (
      <HTMLContainer
        style={{
          pointerEvents: 'all',
          width: shape.props.w,
          height: shape.props.h,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#2A3135',
            border: '2px solid #F8971D',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(248, 151, 29, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <C1CardContent
            shapeId={shape.id}
            prompt={shape.props.prompt}
            savedResponse={shape.props.response}
          />
        </div>
      </HTMLContainer>
    );
  }

  override indicator(shape: C1CardShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}

// Component to handle C1 API call and rendering
function C1CardContent({
  shapeId,
  prompt,
  savedResponse
}: {
  shapeId: string;
  prompt: string;
  savedResponse?: string;
}) {
  const editor = useEditor();
  const [streamData, setStreamData] = useState<string>(savedResponse || '');
  const [loading, setLoading] = useState(!savedResponse);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Skip fetching if we already have a saved response
    if (savedResponse) {
      setLoading(false);
      return;
    }

    async function fetchC1Response() {
      if (!prompt) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to fetch C1 response');
        }

        // Stream the response and update in real-time
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let accumulated = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            accumulated += chunk;

            // Clean and decode the accumulated data
            let cleanData = accumulated;

            // Remove <content> tags if present
            cleanData = cleanData.replace(/<\/?content>/g, '');

            // Decode HTML entities
            const textarea = document.createElement('textarea');
            textarea.innerHTML = cleanData;
            cleanData = textarea.value;

            setStreamData(cleanData);
          }

          // Final cleanup after stream completes
          let finalCleanData = accumulated;
          finalCleanData = finalCleanData.replace(/<\/?content>/g, '');
          const textarea = document.createElement('textarea');
          textarea.innerHTML = finalCleanData;
          finalCleanData = textarea.value;

          console.log('Final accumulated data (raw):', accumulated.substring(0, 300));
          console.log('Final cleaned data for C1Component:', finalCleanData.substring(0, 300));
          setStreamData(finalCleanData);
          setLoading(false);

          // Save the response to the shape so it doesn't re-fetch on reload
          editor.updateShape({
            id: shapeId as any,
            type: 'c1Card',
            props: {
              response: finalCleanData,
            },
          });
        }
      } catch (err: any) {
        console.error('C1 card error:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchC1Response();
  }, [prompt, savedResponse, editor, shapeId]);

  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F7F1DB',
          fontSize: '14px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(247, 241, 219, 0.2)',
              borderTop: '3px solid #F8971D',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12px',
            }}
          />
          Generating...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ff6b6b',
          fontSize: '14px',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        Error: {error}
      </div>
    );
  }

  // Show the streamed content as it arrives
  if (!streamData && !loading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(247, 241, 219, 0.5)',
          fontSize: '14px',
        }}
      >
        No response received
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', padding: '16px' }}>
      <ThemeProvider>
        <C1Component
          c1Response={streamData}
          isStreaming={loading}
        />
      </ThemeProvider>
    </div>
  );
}

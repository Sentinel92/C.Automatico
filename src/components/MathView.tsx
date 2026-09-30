import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '' }) => {
  const renderedHtml = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return null;
    }
  }, [math, block]);

  if (!renderedHtml) {
    return <code className={`font-mono text-xs ${className}`}>{math}</code>;
  }

  return (
    <span
      className={`inline-block select-text ${block ? 'my-2 w-full text-center overflow-x-auto py-1' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

import React from 'react';
import sanitizeHtml from 'sanitize-html';

interface SafeHtmlProps {
  html: string;
  tag?: React.ElementType;
  className?: string;
}

export const SafeHtml: React.FC<SafeHtmlProps> = ({ html, tag: Tag = 'div', className }) => {
  const sanitizedHtml = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['span']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      span: ['style', 'class'],
    },
    allowedStyles: {
      '*': {
        color: [/^#[0-9A-Fa-f]{3,6}$/],
      },
    },
  });

  return <Tag className={className} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};

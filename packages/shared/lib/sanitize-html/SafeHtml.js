import { jsx as _jsx } from "react/jsx-runtime";
import sanitizeHtml from 'sanitize-html';
export const SafeHtml = ({ html, tag: Tag = 'div', className }) => {
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
    return _jsx(Tag, { className: className, dangerouslySetInnerHTML: { __html: sanitizedHtml } });
};

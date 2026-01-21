import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
    content: string;
    theme?: 'default' | 'neutral' | 'dark' | 'forest';
    isDarkMode: boolean;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, theme, isDarkMode }) => {
    // Priority: usage of global dark mode for markdown, or specific mermaid theme if needed. 
    // Generally for Markdown we want to follow the UI mode.
    const isDark = isDarkMode; // Override theme-based decision for consistency

    return (
        <div className={`prose max-w-none p-8 select-text ${isDark ? 'prose-invert' : 'prose-slate'} prose-headings:font-bold prose-a:text-indigo-600 prose-img:rounded-xl prose-table:border-collapse prose-th:border prose-th:border-slate-300 dark:prose-th:border-slate-700 prose-th:p-2 prose-td:border prose-td:border-slate-300 dark:prose-td:border-slate-700 prose-td:p-2 print:p-0 print:max-w-none`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || '*No content provided*'}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownPreview;

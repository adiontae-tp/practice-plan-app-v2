import React, { useCallback, useRef, useState } from 'react';

export interface TPRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
  label?: string;
  hint?: string;
  required?: boolean;
  error?: string;
}

/**
 * TPRichTextEditor - Web version using textarea
 * Note: For web, we use a simple textarea. Rich formatting toolbar is available in the web app's
 * TPRichTextEditor component which uses @tiptap/react.
 */
export function TPRichTextEditor({
  value,
  onChange,
  placeholder = 'Add notes...',
  disabled = false,
  minHeight = 150,
  label,
  hint,
  required = false,
  error,
}: TPRichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      onChange(text);
    },
    [onChange]
  );

  const applyFormat = useCallback((format: 'bold' | 'italic' | 'bullets' | 'numbers') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    let newText = '';
    let cursorPos = start;

    switch (format) {
      case 'bold':
        newText = `${beforeText}<strong>${selectedText}</strong>${afterText}`;
        cursorPos = start + 8; // length of '<strong>'
        setIsBold(!isBold);
        break;
      case 'italic':
        newText = `${beforeText}<em>${selectedText}</em>${afterText}`;
        cursorPos = start + 4; // length of '<em>'
        setIsItalic(!isItalic);
        break;
      case 'bullets':
        newText = `${beforeText}<ul><li>${selectedText || 'List item'}</li></ul>${afterText}`;
        cursorPos = start + 8; // length of '<ul><li>'
        break;
      case 'numbers':
        newText = `${beforeText}<ol><li>${selectedText || 'List item'}</li></ol>${afterText}`;
        cursorPos = start + 8; // length of '<ol><li>'
        break;
    }

    onChange(newText);

    // Set cursor position after update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  }, [onChange, isBold, isItalic]);

  // Strip HTML tags for display in textarea (showing plain text)
  const displayValue = value.replace(/<[^>]*>/g, '');

  return (
    <div className="mb-6">
      {label && (
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={`border rounded-xl overflow-hidden ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'opacity-60 bg-gray-50' : 'bg-white'}`}
      >
        {/* Toolbar */}
        <div className="bg-gray-50 border-b border-gray-300 px-3 py-2 flex gap-2">
          <button
            type="button"
            onClick={() => applyFormat('bold')}
            disabled={disabled}
            className={`px-3 py-1 rounded font-semibold text-lg ${
              isBold ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => applyFormat('italic')}
            disabled={disabled}
            className={`px-3 py-1 rounded italic text-lg ${
              isItalic ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => applyFormat('bullets')}
            disabled={disabled}
            className="px-3 py-1 rounded text-lg text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => applyFormat('numbers')}
            disabled={disabled}
            className="px-3 py-1 rounded text-lg text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            1.
          </button>
        </div>

        {/* Editor */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full p-3 resize-y font-sans text-base leading-relaxed focus:outline-none ${
            disabled ? 'bg-gray-50 text-gray-500' : 'bg-white text-gray-900'
          }`}
          style={{ minHeight: `${minHeight}px` }}
        />
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

export type { TPRichTextEditorProps };

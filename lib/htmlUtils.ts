// Shared HTML/text helpers used to implement copy-only editing in the preview.

/**
 * Convert an HTML string into plain text by stripping all tags.
 * Uses a temporary DOM container; intended for client-side use only.
 */
export function htmlToPlainText(html: string): string {
	if (!html) return '';
	if (typeof window === 'undefined' || typeof document === 'undefined') return html;
	const div = document.createElement('div');
	div.innerHTML = html;
	return div.textContent || div.innerText || '';
}

/** Escape special HTML characters in a plain text string. */
export function escapeHtml(text: string): string {
	if (text == null) return '';
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		return String(text)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}
	const div = document.createElement('div');
	div.textContent = String(text);
	return div.innerHTML;
}

/**
 * Turn a plain text string (possibly with newlines) into a single
 * paragraph with <br> between lines, escaping the content.
 */
export function plainTextToParagraphs(text: string): string {
	const t = (text || '').replace(/\r\n?/g, '\n');
	const lines = t.split(/\n+/).map(escapeHtml);
	return `<p>${lines.join('<br>')}</p>`;
}

/** Convert inline/editable HTML to a paragraph-wrapped HTML (copy-only). */
export function inlineHtmlToParagraphHtml(html: string): string {
	return plainTextToParagraphs(htmlToPlainText(html || ''));
}

export {};

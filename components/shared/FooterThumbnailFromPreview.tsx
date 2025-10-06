import React from 'react';

export interface FooterThumbnailFromPreviewProps {
	html?: string;
	width?: number;
	height?: number;
}

// Placeholder component until real implementation restored
export const FooterThumbnailFromPreview: React.FC<FooterThumbnailFromPreviewProps> = ({ html, width = 120, height = 80 }) => {
	return (
		<div style={{ width, height, overflow: 'hidden', border: '1px solid #e0e0e0', borderRadius: 4, background: '#fafafa', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
			{html ? 'Footer Preview' : 'No Footer'}
		</div>
	);
};

export default FooterThumbnailFromPreview;

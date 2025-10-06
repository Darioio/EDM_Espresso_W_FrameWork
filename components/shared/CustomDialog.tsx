import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export interface CustomDialogProps {
	open: boolean;
	title?: string;
	onClose: () => void;
	actions?: React.ReactNode;
	children?: React.ReactNode;
	maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

// Minimal placeholder dialog (restored after empty file detected)
export const CustomDialog: React.FC<CustomDialogProps> = ({ open, title, onClose, actions, children, maxWidth = 'sm' }) => {
	return (
		<Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
			{title && <DialogTitle>{title}</DialogTitle>}
			{children && <DialogContent dividers>{children}</DialogContent>}
			{actions && <DialogActions>{actions}</DialogActions>}
		</Dialog>
	);
};

export default CustomDialog;

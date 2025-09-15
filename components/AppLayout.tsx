import React, { useCallback, useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';

const INITIAL_LEFT = 380;
const INITIAL_RIGHT = 380;
const MIN_WIDTH = 260;
const MAX_WIDTH = 800;

type AppLayoutProps = {
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  rightOpen?: boolean;
  onRightClose?: () => void;
  onRightToggle?: () => void;
  progress?: number; // 0-100, -1 when idle
  buffer?: number;   // 0-100 buffer value for 'buffer' variant
  loading?: boolean; // explicit loading flag to force visibility
  children: React.ReactNode;
};

/**
 * AppLayout provides the application shell: top bar, left sidebar,
 * main content, and a reserved right panel for future features.
 */
export default function AppLayout({ title = 'EDM Espresso', left, right, rightOpen = false, onRightClose, onRightToggle, progress = -1, buffer = -1, loading = false, children }: AppLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(INITIAL_LEFT);
  const [rightWidth, setRightWidth] = useState(INITIAL_RIGHT);
  const [dragging, setDragging] = useState<'left' | 'right' | null>(null);

  const clamp = (v: number) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, v));

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (dragging === 'left') {
      setLeftWidth(clamp(e.clientX));
    } else if (dragging === 'right') {
      const fromRight = window.innerWidth - e.clientX;
      setRightWidth(clamp(fromRight));
    }
  }, [dragging]);

  const stopDrag = useCallback(() => setDragging(null), []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', stopDrag);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', stopDrag);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [dragging, onMouseMove, stopDrag]);

  // Visible when explicitly loading or progress is between 0 and 100
  const progressActive = loading || (typeof progress === 'number' && progress >= 0 && progress < 100);

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Linear determinate progress above the header, primary color */}
      {progressActive && (
        <LinearProgress
          variant="determinate"
          value={Math.max(0, progress || 0)}
          sx={{ position: 'fixed', top: 0, left: 0, right: 0, height: 4, zIndex: (t) => t.zIndex.modal + 1 }}
        />
      )}

      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          backgroundColor: '#F5F6FA',
          boxShadow: 'none',
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flex: 1 }}>
            {title}
          </Typography>
          <IconButton aria-label="Brand customisation" onClick={onRightToggle}>
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Left sidebar */}
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: leftWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: leftWidth,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 1, overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {left}
        </Box>
      </Drawer>

      {/* Left resizer handle (plain div to avoid Emotion class) */}
      <div
        onMouseDown={() => setDragging('left')}
        style={{
          position: 'fixed',
          left: leftWidth - 3,
          top: 64,
          height: 'calc(100vh - 64px)',
          width: 6,
          cursor: 'col-resize',
          zIndex: 2000,
        }}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${leftWidth}px)` },
          mr: rightOpen ? `${rightWidth}px` : 0,
          paddingTop: '64px', // Push content below header
        }}
      >
        {children}
      </Box>

      {/* Right panel (persistent when open to push main) */}
      <Drawer
        variant={rightOpen ? 'persistent' : 'temporary'}
        anchor="right"
        open={rightOpen}
        onClose={onRightClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          [`& .MuiDrawer-paper`]: { width: rightWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ position: 'relative' }}>
          {/* Right resizer handle inside the drawer on its left edge (plain div) */}
          <div
            onMouseDown={() => setDragging('right')}
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 1 }}
          />
          <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {right}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}

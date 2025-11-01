import React from 'react';
import { Button as MuiButton } from '@mui/material';

export const Button = ({ children, variant = 'contained', ...props }) => {
  return (
    <MuiButton
      variant={variant}
      sx={{
        textTransform: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        ...props.sx
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};
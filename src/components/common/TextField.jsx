import React from 'react';
import { TextField as MuiTextField } from '@mui/material';

export const TextField = ({ ...props }) => {
  return (
    <MuiTextField
      variant="outlined"
      fullWidth
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
        },
        ...props.sx
      }}
      {...props}
    />
  );
};
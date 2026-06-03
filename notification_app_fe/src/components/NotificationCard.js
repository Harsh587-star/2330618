import React from 'react';
import {
  Card, CardContent, Typography, Chip, Box, IconButton, Tooltip
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const typeConfig = {
  Placement: { color: 'success', icon: <WorkIcon fontSize="small" />, bg: '#e8f5e9' },
  Result:    { color: 'warning', icon: <SchoolIcon fontSize="small" />, bg: '#fff8e1' },
  Event:     { color: 'info',    icon: <EventIcon fontSize="small" />,  bg: '#e3f2fd' },
};

function NotificationCard({ notification, isRead, onMarkRead }) {
  const { Type, Message, Timestamp, ID } = notification;
  const config = typeConfig[Type] || typeConfig['Event'];

  return (
    <Card
      onClick={() => onMarkRead(ID)}
      sx={{
        mb: 1.5,
        cursor: 'pointer',
        border: isRead ? '1px solid #e0e0e0' : '1.5px solid #1a237e',
        backgroundColor: isRead ? '#fafafa' : config.bg,
        transition: 'all 0.2s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0,0,0,0.12)' },
        opacity: isRead ? 0.75 : 1,
      }}
    >
      <CardContent sx={{ py: '12px !important', px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          {/* Unread dot */}
          {!isRead && (
            <FiberManualRecordIcon sx={{ fontSize: 10, color: '#1a237e', flexShrink: 0 }} />
          )}
          <Chip
            icon={config.icon}
            label={Type}
            color={config.color}
            size="small"
            variant={isRead ? 'outlined' : 'filled'}
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            {Timestamp}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            pl: isRead ? 0 : 2,
            fontWeight: isRead ? 400 : 600,
            color: isRead ? 'text.secondary' : 'text.primary',
          }}
        >
          {Message}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default NotificationCard;

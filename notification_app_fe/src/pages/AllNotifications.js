import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, CircularProgress, Alert,
  ToggleButtonGroup, ToggleButton, Divider, Chip, Button
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import NotificationCard from '../components/NotificationCard';
import { useNotifications } from '../hooks/useNotifications';

const TYPES = ['All', 'Placement', 'Result', 'Event'];

function AllNotifications() {
  const { notifications, loading, error, fetchNotifications } = useNotifications();
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('readIds') || '[]')); }
    catch { return new Set(); }
  });
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    fetchNotifications({ limit: 100 });
  }, [fetchNotifications]);

  const handleMarkRead = (id) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem('readIds', JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const filtered = typeFilter === 'All'
    ? notifications
    : notifications.filter(n => n.Type === typeFilter);

  const unreadCount = filtered.filter(n => !readIds.has(n.ID)).length;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h5">All Notifications</Typography>
          <Typography variant="body2" color="text.secondary">
            {notifications.length} total · {unreadCount} unread
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={() => fetchNotifications({ limit: 100 })}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Filter Tabs */}
      <ToggleButtonGroup
        value={typeFilter}
        exclusive
        onChange={(_, val) => val && setTypeFilter(val)}
        size="small"
        sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}
      >
        {TYPES.map(t => (
          <ToggleButton
            key={t}
            value={t}
            sx={{
              borderRadius: '8px !important',
              border: '1px solid #ddd !important',
              px: 2,
              '&.Mui-selected': {
                backgroundColor: '#1a237e',
                color: '#fff',
                '&:hover': { backgroundColor: '#283593' },
              },
            }}
          >
            {t}
            {t !== 'All' && (
              <Chip
                label={notifications.filter(n => n.Type === t).length}
                size="small"
                sx={{ ml: 0.5, height: 18, fontSize: 10,
                  backgroundColor: typeFilter === t ? 'rgba(255,255,255,0.25)' : '#eee',
                  color: typeFilter === t ? '#fff' : 'inherit'
                }}
              />
            )}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Divider sx={{ mb: 2 }} />

      {/* States */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {!loading && !error && filtered.length === 0 && (
        <Alert severity="info">No notifications found for this filter.</Alert>
      )}

      {/* List */}
      {!loading && filtered.map(notif => (
        <NotificationCard
          key={notif.ID}
          notification={notif}
          isRead={readIds.has(notif.ID)}
          onMarkRead={handleMarkRead}
        />
      ))}
    </Container>
  );
}

export default AllNotifications;

import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, CircularProgress, Alert,
  ToggleButtonGroup, ToggleButton, Divider, Chip,
  Slider, Paper, Button
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import RefreshIcon from '@mui/icons-material/Refresh';
import NotificationCard from '../components/NotificationCard';
import { useNotifications, getTopNByPriority } from '../hooks/useNotifications';

const TYPES = ['All', 'Placement', 'Result', 'Event'];

function PriorityNotifications() {
  const { notifications, loading, error, fetchNotifications } = useNotifications();
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('readIds') || '[]')); }
    catch { return new Set(); }
  });
  const [topN, setTopN] = useState(10);
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

  // Apply type filter first, then pick top N by priority
  const typeFiltered = typeFilter === 'All'
    ? notifications
    : notifications.filter(n => n.Type === typeFilter);

  const priorityList = getTopNByPriority(typeFiltered, topN);
  const unreadCount = priorityList.filter(n => !readIds.has(n.ID)).length;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon sx={{ color: '#f9a825' }} />
          <Box>
            <Typography variant="h5">Priority Inbox</Typography>
            <Typography variant="body2" color="text.secondary">
              Top {topN} · {unreadCount} unread
            </Typography>
          </Box>
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

      {/* Top N Slider */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: 3, background: '#f8f9ff' }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          Show top <strong style={{ color: '#1a237e' }}>{topN}</strong> notifications
        </Typography>
        <Slider
          value={topN}
          onChange={(_, val) => setTopN(val)}
          min={5}
          max={50}
          step={5}
          marks={[
            { value: 5, label: '5' },
            { value: 10, label: '10' },
            { value: 15, label: '15' },
            { value: 20, label: '20' },
            { value: 30, label: '30' },
            { value: 50, label: '50' },
          ]}
          valueLabelDisplay="auto"
          sx={{ color: '#1a237e' }}
        />
      </Paper>

      {/* Type Filter */}
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
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Priority legend */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
          Priority order:
        </Typography>
        {['Placement', 'Result', 'Event'].map((t, i) => (
          <Chip
            key={t}
            label={`${i + 1}. ${t}`}
            size="small"
            color={i === 0 ? 'success' : i === 1 ? 'warning' : 'info'}
            variant="outlined"
          />
        ))}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* States */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && priorityList.length === 0 && (
        <Alert severity="info">No notifications found.</Alert>
      )}

      {/* List */}
      {!loading && priorityList.map((notif, index) => (
        <Box key={notif.ID} sx={{ position: 'relative' }}>
          <Chip
            label={`#${index + 1}`}
            size="small"
            sx={{
              position: 'absolute', top: 8, right: 8, zIndex: 1,
              backgroundColor: '#1a237e', color: '#fff',
              fontSize: 11, height: 20, fontWeight: 700,
            }}
          />
          <NotificationCard
            notification={notif}
            isRead={readIds.has(notif.ID)}
            onMarkRead={handleMarkRead}
          />
        </Box>
      ))}
    </Container>
  );
}

export default PriorityNotifications;

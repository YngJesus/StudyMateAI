# Auto-Notifications Cron Job

## Overview

The notifications module now includes automatic notification generation for upcoming events using NestJS Schedule.

## Features

### Automatic Daily Checks

- **Schedule**: Runs every day at 8:00 AM
- **Purpose**: Scans all events and creates notifications for:
  - 🔴 **URGENT** notifications for events happening TODAY
  - ⚠️ **WARNING** notifications for events happening TOMORROW

### Smart Notification Creation

- Prevents duplicate notifications (checks if notification already exists)
- Automatically formats notification messages with event details
- Sends real-time WebSocket notifications to users
- Includes subject information in notification messages

## Implementation Details

### Files Added

1. **`notifications-cron.service.ts`** - Contains the cron job logic

### Files Modified

1. **`notifications.module.ts`** - Added ScheduleModule and registered the cron service
2. **`notifications.controller.ts`** - Added manual trigger endpoint for testing

### Dependencies Added

- `@nestjs/schedule` - NestJS package for cron jobs and scheduling

## Usage

### Automatic Execution

The cron job runs automatically every day at 8:00 AM. No manual intervention required.

### Manual Testing

You can manually trigger the cron job for testing purposes:

**Endpoint**: `POST /notifications/cron/trigger`

**Headers**:

```
Authorization: Bearer <your-jwt-token>
```

**Response**:

```json
{
  "message": "Cron job executed manually"
}
```

**Example with curl**:

```bash
curl -X POST http://localhost:3000/notifications/cron/trigger \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Cron Schedule Configuration

The default schedule is set to run at 8:00 AM every day. You can modify this in `notifications-cron.service.ts`:

```typescript
@Cron(CronExpression.EVERY_DAY_AT_8AM)
```

### Other Schedule Options

```typescript
// Run every minute (for testing)
@Cron(CronExpression.EVERY_MINUTE)

// Run every hour
@Cron(CronExpression.EVERY_HOUR)

// Run at specific time
@Cron('0 8 * * *') // 8:00 AM daily

// Run at multiple times
@Cron('0 8,20 * * *') // 8:00 AM and 8:00 PM daily
```

## Notification Types

### URGENT (🔴)

- **Trigger**: Event date = today
- **Title Format**: `🔴 {EVENT_TYPE} TODAY`
- **Message**: `{title} ({subject}) is scheduled for today!`

### WARNING (⚠️)

- **Trigger**: Event date = tomorrow
- **Title Format**: `⚠️ {EVENT_TYPE} TOMORROW`
- **Message**: `{title} ({subject}) is scheduled for tomorrow!`

## Logging

The cron service includes comprehensive logging:

- When the cron job starts
- Number of notifications created
- Any errors encountered
- Debug logs for duplicate prevention

**Example logs**:

```
[NotificationsCronService] Running cron job: Checking for upcoming events...
[NotificationsCronService] Created 3 urgent and 5 warning notifications
[NotificationsCronService] Created urgent notification for user abc-123: 🔴 EXAM TODAY
```

## Database Impact

### Queries Executed

1. Find events with `date = today`
2. Find events with `date = tomorrow`
3. For each event:
   - Check if notification already exists
   - Create notification if not exists
   - Emit WebSocket event

### Performance Considerations

- Duplicate check prevents notification spam
- Relations are loaded efficiently (subject, user)
- Bulk operations could be added for large datasets

## Testing

### Test Scenarios

1. **Create an event for today**:

   ```bash
   POST /events
   {
     "title": "Final Exam",
     "type": "exam",
     "date": "2025-11-29", // today's date
     "subjectId": "your-subject-id"
   }
   ```

2. **Trigger cron manually**:

   ```bash
   POST /notifications/cron/trigger
   ```

3. **Check notifications**:

   ```bash
   GET /notifications
   ```

4. **Verify duplicate prevention** - trigger cron again and confirm no duplicate notifications

## Future Enhancements

Potential improvements:

- [ ] Configurable notification times per user
- [ ] Weekly summaries of upcoming events
- [ ] Email notifications in addition to in-app
- [ ] Customizable notification messages
- [ ] Notification preferences (opt-in/opt-out per event type)
- [ ] Timezone support for multi-region users

## Troubleshooting

### Cron job not running

1. Check that `ScheduleModule.forRoot()` is imported in the module
2. Verify the service is registered in the providers array
3. Check application logs for errors

### Notifications not appearing

1. Verify events exist with today's or tomorrow's date
2. Check date format matches `YYYY-MM-DD`
3. Ensure WebSocket connection is active
4. Check notification table in database

### Duplicate notifications

- The service includes duplicate prevention logic
- If duplicates occur, check the `existingNotification` query logic

## Support

For issues or questions:

1. Check application logs
2. Review this README
3. Test with manual trigger endpoint
4. Verify database records

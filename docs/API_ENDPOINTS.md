# API Endpoints Documentation

This document outlines the API endpoints that the React frontend expects from the Laravel backend.

## Base URL
- Development: `http://localhost:8000/api`
- Production: `https://your-laravel-backend.com/api`

## Authentication
All requests should include the Authorization header:
```
Authorization: Bearer {token}
```

## Dashboard Endpoints

### GET /dashboard/stats
Get dashboard statistics
```json
{
  "success": true,
  "data": {
    "total_meetings": 24,
    "this_week_meetings": 8,
    "notifications_sent": 156,
    "active_participants": 42
  }
}
```

### GET /dashboard/upcoming-meetings
Get upcoming meetings for dashboard
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Project Phoenix Kickoff",
      "date": "2023-10-25",
      "time": "10:00",
      "location": "Conference Room A",
      "designated_attendee": "Juan Rodriguez",
      "status": "confirmed",
      "whatsapp_reminder_enabled": true,
      "group_notification_enabled": true,
      "created_at": "2023-10-23T10:00:00Z",
      "updated_at": "2023-10-23T10:00:00Z"
    }
  ]
}
```

## Meetings Endpoints

### GET /meetings
Get paginated meetings list
```
Query Parameters:
- page: int (default: 1)
- per_page: int (default: 10)
- status: string (optional)
- date_from: string (optional, YYYY-MM-DD)
- date_to: string (optional, YYYY-MM-DD)
```

### GET /meetings/{id}
Get specific meeting details

### POST /meetings
Create new meeting
```json
{
  "title": "Meeting Title",
  "date": "2023-10-25",
  "time": "10:00",
  "location": "Conference Room A",
  "designated_attendee": "Juan Rodriguez",
  "dress_code": "Business Casual",
  "invitation_reference": "REF-2023-001",
  "attendance_link": "https://forms/attendance",
  "discussion_results": "Meeting notes...",
  "whatsapp_reminder_enabled": true,
  "group_notification_enabled": true
}
```

### PUT /meetings/{id}
Update existing meeting (same payload as POST)

### DELETE /meetings/{id}
Delete meeting

### POST /meetings/{id}/send-reminder
Send WhatsApp reminder for specific meeting

## Participants Endpoints

### GET /participants
Get paginated participants list

### GET /participants/search
Search participants
```
Query Parameters:
- q: string (search query)
```

### POST /participants
Create new participant
```json
{
  "name": "Juan Rodriguez",
  "whatsapp_number": "+52 1 55 1234 5678"
}
```

### PUT /participants/{id}
Update existing participant

### DELETE /participants/{id}
Delete participant

## Settings Endpoints

### GET /settings
Get current settings
```json
{
  "success": true,
  "data": {
    "id": "1",
    "group_notification_time": "07:00",
    "group_notification_enabled": true,
    "individual_reminder_minutes": 30,
    "individual_reminder_enabled": true,
    "whatsapp_connected": true,
    "updated_at": "2023-10-23T10:00:00Z"
  }
}
```

### PUT /settings
Update settings
```json
{
  "group_notification_time": "07:00",
  "group_notification_enabled": true,
  "individual_reminder_minutes": 30,
  "individual_reminder_enabled": true
}
```

### POST /settings/test-whatsapp
Test WhatsApp connection
```json
{
  "success": true,
  "data": {
    "connected": true
  }
}
```

## Error Responses
All endpoints should return errors in this format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

## HTTP Status Codes
- 200: Success
- 201: Created
- 422: Validation Error  
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
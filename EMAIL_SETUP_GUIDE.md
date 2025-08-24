# Email Notification Setup Guide

This guide will help you set up email notifications for the Burlington Ballers app using EmailJS.

## EmailJS Setup

1. **Create an EmailJS Account**
   - Go to [EmailJS.com](https://www.emailjs.com/)
   - Sign up for a free account (100 emails/month free)

2. **Add an Email Service**
   - In your EmailJS dashboard, go to "Email Services"
   - Click "Add New Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - **Important**: Set the "From Name" to "Burlington Ballers"
   - Follow the setup instructions
   
   **Recommended Setup:**
   - **From Name**: `Burlington Ballers`
   - **From Email**: Your email address (e.g., `arthur@gmail.com`)
   - **Reply To**: Same email address

3. **Create Email Templates**
   
   You need to create 3 email templates:

   ### RSVP Reminder Template
   **Template Name**: `burlington_ballers_rsvp_reminder`
   
   **Subject**: `🏀 RSVP Needed: {{game_title}} tomorrow!`
   
   **Content**:
   ```html
   Hi {{user_name}},

   You haven't responded yet to tomorrow's basketball game!

   **Game Details:**
   📅 {{game_date}} at {{game_time}}
   📍 {{game_location}}
   🏀 {{game_title}}

   Please visit www.burlingtonballers.com to let us know if you're coming!

   Don't forget to share www.burlingtonballers.com with friends who might want to join us! 🏀

   Best,
   Burlington Ballers
   ```

   ### Attendance Reminder Template
   **Template Name**: `burlington_ballers_attendance_reminder`
   
   **Subject**: `🏀 Game Tomorrow: {{game_title}}`
   
   **Content**:
   ```html
   Hi {{user_name}},

   Just a reminder that you're signed up for tomorrow's game!

   **Game Details:**
   📅 {{game_date}} at {{game_time}}
   📍 {{game_location}}
   🏀 {{game_title}}

   See you on the court! 🏀

   Feel free to invite friends by sharing www.burlingtonballers.com with them!

   Best,
   Burlington Ballers
   ```

   ### Game Change Notification Template
   **Template Name**: `burlington_ballers_game_change`
   
   **Subject**: `🏀 Game Update: {{game_title}}`
   
   **Content**:
   ```html
   Hi {{user_name}},

   There's been an update to a game you're attending:

   **{{changes}}**

   **Updated Game Details:**
   📅 {{game_date}} at {{game_time}}
   📍 {{game_location}}
   🏀 {{game_title}}

   Check www.burlingtonballers.com for the latest details.

   Don't forget to share www.burlingtonballers.com with friends who might want to join! 🏀

   Best,
   Burlington Ballers
   ```

4. **Get Your Configuration Values**
   - **Public Key**: Dashboard → Account → General → Public Key
   - **Service ID**: Email Services → Your Service → Service ID
   - **Template IDs**: Email Templates → Template Name → Template ID

5. **Update Environment Variables**
   
   Add these to your `.env` file:
   ```
   REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key_here
   REACT_APP_EMAILJS_SERVICE_ID=your_service_id_here
   REACT_APP_EMAILJS_RSVP_TEMPLATE_ID=your_rsvp_template_id_here
   REACT_APP_EMAILJS_ATTENDANCE_TEMPLATE_ID=your_attendance_template_id_here
   REACT_APP_EMAILJS_GAME_CHANGE_TEMPLATE_ID=your_game_change_template_id_here
   ```

## How It Works

### Daily Notifications (5 PM)
- **RSVP Reminders**: Sent to users who haven't responded to tomorrow's games (if they have `rsvpReminders` enabled)
- **Attendance Reminders**: Sent to users who are attending tomorrow's games (if they have `attendanceReminders` enabled)

### Real-time Game Change Notifications
- Sent immediately when a game organizer changes time or location
- Only sent to users who RSVP'd "yes" and have `gameChangeNotifications` enabled  
- Rate limited to max 2 notifications per game per hour to prevent spam

### User Controls
Users can control their email preferences in the Settings page:
- ✅ **RSVP Reminders**: "Remind me about games I haven't responded to"
- ✅ **Attendance Reminders**: "24hr reminders for games I'm attending"  
- ✅ **Game Change Notifications**: "When games I've RSVPd to change (time/location)"

All emails include a call-to-action to share www.burlingtonballers.com with friends! 🏀

## Testing
- The notification scheduler checks every minute but only sends at 5:00 PM
- You can test by temporarily modifying the hour check in `notificationScheduler.js`
- Game change notifications are sent immediately when organizers edit games
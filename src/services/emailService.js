import emailjs from '@emailjs/browser';

class EmailService {
  constructor() {
    // Initialize EmailJS with your public key
    emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
  }

  async sendRSVPReminder(userEmail, userName, game) {
    const templateParams = {
      to_email: userEmail,
      user_name: userName,
      game_title: game.title,
      game_date: game.date,
      game_time: game.time,
      game_location: game.location,
      website_url: 'www.burlingtonballers.com',
      type: 'RSVP Reminder'
    };

    try {
      const response = await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_RSVP_TEMPLATE_ID,
        templateParams
      );
      console.log('RSVP reminder sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to send RSVP reminder:', error);
      throw error;
    }
  }


  async sendGameChangeNotification(userEmail, userName, game, changes) {
    const templateParams = {
      to_email: userEmail,
      user_name: userName,
      game_title: game.title,
      game_date: game.date,
      game_time: game.time,
      game_location: game.location,
      changes: changes,
      website_url: 'www.burlingtonballers.com',
      type: 'Game Update'
    };

    try {
      const response = await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_GAME_CHANGE_TEMPLATE_ID,
        templateParams
      );
      console.log('Game change notification sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to send game change notification:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
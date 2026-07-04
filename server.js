const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');

// =========================================================================
// ✉️ YOUR SMTP EMAIL CONFIGURATION (EDIT DIRECTLY HERE)
// Fill in your office email details to receive form submissions in your inbox.
// =========================================================================
const SMTP_CONFIG = {
  host: 'smtp.gmail.com',                 // SMTP server (e.g. smtp.gmail.com or smtp.office365.com)
  port: 587,                              // SMTP port (usually 587 for TLS, or 465 for SSL)
  secure: false,                          // Set to true if using port 465 (SSL), false for 587 (TLS)
  user: 'himeshmungapati08@gmail.com',    // YOUR OFFICE EMAIL ID (Sender account)
  pass: 'pzzw jxrg uzvz gzmj',            // YOUR APP-SPECIFIC PASSWORD (or email account password)
  emailTo: 'himeshmungapati08@gmail.com'  // RECIPIENT OFFICE EMAIL ID (where you want to receive the inquiries)
};
// =========================================================================

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static website files from the current directory
app.use(express.static(__dirname));

const INQUIRIES_FILE = path.join(__dirname, 'submissions.json');
const SUBSCRIPTIONS_FILE = path.join(__dirname, 'subscriptions.json');

// Helper to read JSON file safely
const readJsonFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

// Helper to write JSON file safely
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    return false;
  }
};

// Configure Nodemailer transporter
let transporter = null;
let isEthereal = false;
const isConfigured = SMTP_CONFIG.user && SMTP_CONFIG.pass && !SMTP_CONFIG.pass.includes('xxxx');

if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: SMTP_CONFIG.secure,
    auth: {
      user: SMTP_CONFIG.user,
      pass: SMTP_CONFIG.pass
    }
  });
  console.log('Nodemailer SMTP transporter initialized with user:', SMTP_CONFIG.user);
} else {
  // Automatically generate Ethereal SMTP test credentials for zero-configuration testing
  isEthereal = true;
  nodemailer.createTestAccount((err, account) => {
    if (err) {
      console.error('Failed to create Ethereal testing account:', err.message);
      return;
    }
    transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });
    console.log('-----------------------------------------------------------------------------------');
    console.log('✨ Ethereal test SMTP account automatically created!');
    console.log('   Inquiries submitted now will generate instant email mockups.');
    console.log('   Copy of SMTP user credentials: ' + account.user);
    console.log('-----------------------------------------------------------------------------------');
  });
}

// POST route for contact inquiries
app.post('/api/inquiry', (req, res) => {
  const { name, email, business, industry, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required.' });
  }

  const newInquiry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    name,
    email,
    business: business || 'N/A',
    industry: industry || 'N/A',
    budget: budget || 'N/A',
    message: message || 'N/A'
  };

  const inquiries = readJsonFile(INQUIRIES_FILE);
  inquiries.push(newInquiry);
  
  if (writeJsonFile(INQUIRIES_FILE, inquiries)) {
    console.log('New Inquiry Saved locally:', newInquiry);

    // Send email alert
    if (transporter) {
      const emailTo = isEthereal ? 'himeshmungapati08@gmail.com' : (SMTP_CONFIG.emailTo || SMTP_CONFIG.user);
      const mailOptions = {
        from: isEthereal ? `"CrimsonStack Test Account" <${transporter.options.auth.user}>` : `"CrimsonStack Web Portal" <${SMTP_CONFIG.user}>`,
        to: emailTo,
        subject: `New Client Project Inquiry: ${name} (${business})`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; border: 1px solid #1a1a1a; padding: 25px; border-radius: 12px; background-color: #0b0b0b; color: #ffffff;">
            <h2 style="color: #E63946; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; font-family: Georgia, serif; font-weight: normal; margin-top: 0;">New Project Inquiry</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: rgba(255,255,255,0.5); width: 140px;">Client Name:</td>
                <td style="padding: 6px 0; color: #ffffff; font-weight: bold;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: rgba(255,255,255,0.5);">Contact Email:</td>
                <td style="padding: 6px 0; color: #ffffff;"><a href="mailto:${email}" style="color: #E63946; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: rgba(255,255,255,0.5);">Business Name:</td>
                <td style="padding: 6px 0; color: #ffffff;">${business}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: rgba(255,255,255,0.5);">Industry Focus:</td>
                <td style="padding: 6px 0; color: #ffffff;">${industry}</td>
              </tr>

            </table>
            <div style="margin-top: 25px;">
              <h4 style="margin: 0 0 10px 0; color: rgba(255,255,255,0.7); font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Project Details:</h4>
              <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.85); font-style: italic; white-space: pre-wrap;">${message}</div>
            </div>
            <p style="font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 15px;">
              Sent automatically on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST) from CrimsonStack website.
            </p>
          </div>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('SMTP email dispatch error:', error);
        } else {
          console.log('Notification email successfully dispatched:', info.response);
          // Log ethereal preview URL if active
          if (isEthereal) {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log('-----------------------------------------------------------------------------------');
            console.log('👉 View test email in your browser here:');
            console.log('   ' + previewUrl);
            console.log('-----------------------------------------------------------------------------------');
          }
        }
      });
    }

    return res.status(200).json({ success: true, message: 'Inquiry successfully saved.', data: newInquiry });
  } else {
    return res.status(500).json({ success: false, error: 'Failed to write data to disk.' });
  }
});

// POST route for newsletter subscriptions
app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  const newSubscription = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    email
  };

  const subscriptions = readJsonFile(SUBSCRIPTIONS_FILE);
  // Check duplicate
  if (subscriptions.some(sub => sub.email.toLowerCase() === email.toLowerCase())) {
    return res.status(200).json({ success: true, message: 'Already subscribed.' });
  }

  subscriptions.push(newSubscription);
  
  if (writeJsonFile(SUBSCRIPTIONS_FILE, subscriptions)) {
    console.log('New Subscription Saved:', newSubscription);

    // Send email alert to office address if SMTP transporter is configured
    if (transporter) {
      const emailTo = SMTP_CONFIG.emailTo || SMTP_CONFIG.user;
      const mailOptions = {
        from: `"CrimsonStack Web Portal" <${SMTP_CONFIG.user}>`,
        to: emailTo,
        subject: `New Newsletter Subscriber: ${email}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; border: 1px solid #1a1a1a; padding: 25px; border-radius: 12px; background-color: #0b0b0b; color: #ffffff;">
            <h2 style="color: #E63946; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; font-family: Georgia, serif; font-weight: normal; margin-top: 0;">New Subscription</h2>
            <p style="font-size: 14px; color: rgba(255,255,255,0.85); line-height: 1.6;">
              A new visitor has subscribed to receive design intel and newsletters.
            </p>
            <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 15px; border-radius: 8px; font-size: 16px; color: #E63946; text-align: center; font-weight: bold; margin-top: 20px;">
              ${email}
            </div>
            <p style="font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 15px;">
              Sent automatically on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST) from CrimsonStack website.
            </p>
          </div>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('SMTP subscription email error:', error);
        } else {
          console.log('Subscription notification email dispatched:', info.response);
        }
      });
    }

    return res.status(200).json({ success: true, message: 'Subscription successfully saved.' });
  } else {
    return res.status(500).json({ success: false, error: 'Failed to write data to disk.' });
  }
});

// GET route to inspect submissions through browser
app.get('/api/submissions', (req, res) => {
  const inquiries = readJsonFile(INQUIRIES_FILE);
  const subscriptions = readJsonFile(SUBSCRIPTIONS_FILE);
  res.json({ inquiries, subscriptions });
});

// Start the server

const USERS_FILE = path.join(__dirname, 'users.json');

// POST route for Google OAuth user synchronization
app.post('/api/auth/google', (req, res) => {
  const { name, email, avatar } = req.body;

  if (!email || !name) {
    return res.status(400).json({ success: false, error: 'Name and email are required.' });
  }

  const users = readJsonFile(USERS_FILE);
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    // Update existing user login details
    user.lastLogin = new Date().toISOString();
    user.name = name;
    user.avatar = avatar;
  } else {
    // Create new user profile
    user = {
      id: Date.now().toString(),
      registeredAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      name,
      email,
      avatar
    };
    users.push(user);
  }

  if (writeJsonFile(USERS_FILE, users)) {
    console.log('User synced successfully:', user.name + ' (' + user.email + ')');
    return res.status(200).json({ success: true, user });
  } else {
    return res.status(500).json({ success: false, error: 'Failed to write user database.' });
  }
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  CrimsonStack backend running at:`);
  console.log(`  👉 http://localhost:${PORT}`);
  console.log(`===================================================`);
});

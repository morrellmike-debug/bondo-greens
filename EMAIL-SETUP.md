# @bondogreens.com Email Setup Guide

To send professional emails from `jim@bondogreens.com` and others, we need to verify your domain ownership with an email provider. I recommend **Resend** for the automated app emails and **Google Workspace** (or similar) if you want a full inbox for these addresses.

### Step 1: Verification (Mike's Action)
Please provide the following so I can generate the DNS records for you:
1. **Domain Registrar:** Where did you buy `bondogreens.com`? (e.g., GoDaddy, Namecheap, Google Domains).
2. **Setup Preference:**
   - **Option A (App Only):** Just allows the app to send emails *as* Jim. Free and fast.
   - **Option B (Full Inbox):** You, Jim, Brian, and Patty can log in to check email. Requires a paid subscription (usually ~$6/user/mo).

### Step 2: The "Confirmation" Script
I'm building the backend service to trigger the following when someone hits "Submit":
- **To Registrant:** A receipt from `Jim <jim@bondogreens.com>` summarizing their registration and donation.
- **To Mike/Jim:** A notification that a new registration just came in.

### Step 3: Admin Customization
I'll add a **"Domain Management"** tab to your Admin Portal. You'll be able to:
- See the status of each @bondogreens.com address.
- Add or remove new email aliases for Brian or Patty.

**Which way are we leaning—just sending from the app (Option A) or full inboxes for everyone (Option B)?**

# Link Redirection Service

A web service that allows you to manage and redirect links based on expiration dates, with the ability to mask the original URLs using shortened or custom URLs.

## Features

- **Redirect and Expiration Logic**: Automatically redirects to different URLs based on expiration dates
- **URL Masking**: Hides original URLs with shortened/custom URLs
- **Link Management**: Add, delete, and view links through a simple interface
- **Data Storage**: Stores all link data in Google Sheets

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Google Apps Script
- Hosting: GitHub Pages
- Data Storage: Google Sheets

## Setup Instructions

### 1. Google Apps Script Setup

1. Go to https://script.google.com/ and create a new project
2. Copy and paste the scripts from the `google_apps_script` folder
3. Click on "Deploy" > "New deployment" 
4. Select "Web app" as the deployment type
5. Set "Execute as" to "Me"
6. Set "Who has access" to "Anyone"
7. Click "Deploy"
8. Copy the Web App URL that's generated

### 2. Update Frontend Code

1. Open `assets/js/main.js` and update the `SCRIPT_URL` variable with your Google Apps Script Web App URL
2. Also update the script URL in the `redirect.html` file

### 3. Deploy to GitHub Pages

1. Push the code to your GitHub repository
2. Go to repository Settings > Pages
3. Choose the main branch as the source
4. Click "Save"
5. Your site will be published at the URL provided

## Usage

### Adding a New Link

1. Enter the primary (prime) link that you want to redirect to initially
2. Enter the expiration link that will be used after the expiration date
3. Set the expiration date
4. Optionally add a custom slug (or let the system generate one)
5. Click "Add Link"

### Managing Links

The main page displays all your links with their:
- Short URL
- Primary link
- Expiration link
- Expiration date
- Status (Active/Expired)

You can copy the short URL to share with others or delete links you no longer need.

## How It Works

When someone visits a shortened URL:
1. The system checks if the link exists
2. It compares the current date with the expiration date
3. If the current date is before the expiration date, it redirects to the primary link
4. If the current date is after the expiration date, it redirects to the expiration link

## License

[MIT License](LICENSE)

# Top N Words Finder

A web app that extracts and displays the top N most frequent words from a specified webpage URL, with pagination and real-time feedback.

## Features

- **Top N Words Analysis**: Enter a URL and choose `N` to find the top N words by frequency.
- **Pagination**: Results displayed in pages, with navigation links.
- **Flash Messages**: Feedback for errors (e.g., invalid URL) and status updates.
- **Loading Spinner**: Indicates processing when fetching data or navigating pages.
- **Error Handling**: Handles invalid inputs and server errors gracefully.
- **Centered Footer**: Simple copyright footer.

## Stack

- **Backend**: Express.js for routing and session management.
- **Data Parsing**: Axios for fetching data, Cheerio for HTML parsing.
- **Text Processing**: Counts word frequencies using a min-heap for top results.
- **Frontend**: EJS templates with Bootstrap 5 for responsive design.

## Setup

1. **Install**: Run `npm install`.
2. **Start**: Run `node app.js` or `npm start` and open `http://localhost:3000`.

--- 

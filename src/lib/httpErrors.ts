/**
 * HTTP Error Messages
 *
 * User-friendly error messages for common HTTP status codes.
 * Used in error pages and error handling throughout the application.
 *
 * @module httpErrors
 */

type HttpErrors = {
  [key: number]: string;
};

const httpErrors: HttpErrors = {
  400: 'Hmm… something seems off with your request 🤔',
  401: 'You need to log in to see this page 🔒',
  403: "Sorry, you don't have permission to view this 🚫",
  404: "Oops! The page you're looking for wandered off 🕵️‍♂️",
  410: 'This content has been deleted 😢',
  422: "We couldn't process that – maybe check your input ✏️",
  429: "Whoa! You're going too fast 🚀 Slow down a bit",
  500: 'Oh no! Something went wrong on our side ⚡ Try refreshing the page.',
  503: 'Our service is taking a nap 💤 Please try again later',
};

export default httpErrors;

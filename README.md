# Echo Landing Page

This is the landing page and React application for Echo, a story generation platform.

## Recent Architectural Changes

The application has been refactored to call the remote backend API directly, rather than using Next.js API routes as middleware.

### API Client

A centralized API client has been implemented at `src/api/index.ts` to interact with the backend at `http://35.223.31.93:8000/api`. The API client:

- Uses axios for all HTTP requests
- Includes appropriate timeout handling (5 minute timeout for long-running processes)
- Groups API functions by resource type (user, order, payment, story, etc.)
- Provides a combined function to handle the complete story generation process

### Key API Endpoints

The backend API exposes several endpoints:

- **User Management**
  - `GET /user?user_id={id}` - Get user data
  - `POST /user/update` - Update user data

- **Order Management**
  - `POST /orders` - Create a new order

- **Payment Processing**
  - `POST /payments/confirm` - Confirm payment for an order

- **Story Management**
  - `GET /story?user_id={id}` - Get all stories for a user
  - `GET /story/{id}` - Get a specific story

- **Story Generation**
  - `POST /yunsuan` - Generate an image based on user data (first step)
  - `POST /tuisuan` - Generate a story based on the image (second step)

### Flow

The application follows a specific flow for story generation:

1. Create an order
2. Confirm payment
3. Generate an image using the yunsuan service
4. Generate a story using the tuisuan service (which requires the yunsuan result)

This flow is encapsulated in the `generateCompleteStory` function in the API client, making it easy to use throughout the application.

## Development

To run the application locally:

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

## Notes

- The backend API at `35.223.31.93:8000` must be accessible for the application to function correctly.
- Long-running processes like image and story generation can take several minutes to complete. 
import axios from 'axios';

// Base URL for the backend API
// Using relative URL to work with Next.js rewrites/proxy
const API_BASE_URL = '/api';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minute timeout for long-running processes
  headers: {
    'Content-Type': 'application/json',
  },
  // No need for withCredentials with proxy approach
});

// Types
export interface UserData {
  user_id?: string;
  display_name: string;
  birth_date: string;
  birth_location: string;
  primary_residence: string;
  current_location: string;
  college: string;
  educational_level: string;
  profession: string;
  primary_interest: string;
  religion?: string;
  race?: string;
  parental_income?: number;
}

export interface StoryData {
  story_id: number;
  transaction_id: string;
  generated_story_text: string;
  timestamp: string;
}

export interface OrderData {
  order_id: number;
  user_id: string;
  amount: number;
}

export interface PaymentData {
  session_id: number;
  order_id: number;
  user_id: string;
}

export interface WikiPageData {
  page_id: number;
  page_title: string;
  page_content: string;
}

export interface YunsuanData {
  story_id: number;
  transaction_id: string;
  generated_story_text: string
}

export interface TuisuanData {
  story_id: number;
  transaction_id: string;
  generated_story_text: string;
  wiki_pages: string[];
}


export interface ProcessedEventData {
  user_id: number;
  story_id: number;
  text: string;
  annotated_text: string;
  event_type: string;
  event_date: string | null;
}

export interface EventData {
  user_id: number;
  story_id: number;
  text: string;
  annotated_text: string;
  event_type: string;
  event_date: string | null;
  event_id: number;
  coordinates: [number, number, number];
  future_ind: boolean;
}

// User API endpoints
export const userAPI = {
  // Get user data
  getUser: async (userId: string): Promise<UserData> => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },

  // Update user data
  updateUser: async (userData: Partial<UserData> & { user_id: string }): Promise<UserData> => {
    try {
      const response = await apiClient.post(`/users/${userData.user_id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  },

  // Create a new user
  createUser: async (userData: UserData): Promise<UserData> => {
    try {
      const response = await apiClient.put('/user/create', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
};

// Order API endpoints
export const orderAPI = {
  // Create a new order
  createOrder: async (userId: number): Promise<OrderData> => {
    try {
      const response = await apiClient.post('/orders', { user_id: userId });
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
};

// Payment API endpoints
export const paymentAPI = {
  // Confirm payment for an order
  confirmPayment: async (userId: number, orderId: number): Promise<PaymentData> => {
    try {
      const response = await apiClient.post('/payments/confirm', {
        user_id: userId,
        order_id: orderId,
      });
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },
};

// Story API endpoints
export const storyAPI = {
  // Get user stories
  getStories: async (userId: string): Promise<StoryData[]> => {
    try {
      const response = await apiClient.get(`/history?user_id=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  },

  // Get a specific story
  getStory: async (storyId: number): Promise<StoryData> => {
    try {
      const response = await apiClient.get(`/story?story_id=${storyId}`);
      return response.data[0];
    } catch (error) {
      console.error('Error fetching story:', error);
      throw error;
    }
  },

};

export const yunsuanAPI = {
  generateStory: async (
    userId: number,
    orderId: number,
    sessionId: number,
  ): Promise<YunsuanData> => {
    try {
      const response = await apiClient.post('/yunsuan', {
        user_id: userId,
        order_id: orderId,
        session_id: sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Error generating yunsuan story:', error);
      throw error;
    }
  },
};

// Tuisuan API endpoints (story generation)
export const tuisuanAPI = {
  // Generate a story based on yunsuan data
  generateStory: async (
    userId: number,
    orderId: number,
    sessionId: number,
  ): Promise<TuisuanData> => {
    try {
      const response = await apiClient.post('/tuisuan', {
        user_id: userId,
        order_id: orderId,
        session_id: sessionId,
      });
      return response.data;
    } catch (error) {
      console.error('Error generating story:', error);
      throw error;
    }
  },
};

// Combined function to handle the entire story generation process
export const generateCompleteStory = async (
  userId: string
): Promise<number> => {
  try {
    // Step 1: Create an order
    console.log('Creating order...');
    const userIdNumber = parseInt(userId);
    const orderData = await orderAPI.createOrder(userIdNumber);
    const orderId = orderData.order_id;
    
    // Step 2: Confirm payment
    console.log('Confirming payment...');
    const paymentData = await paymentAPI.confirmPayment(userIdNumber, orderId);
    const sessionId = paymentData.session_id;
    
    // Step 3: Generate yunsuan story
    console.log('Generating yunsuan story...');
    const yunsuanData = await yunsuanAPI.generateStory(
      userIdNumber,
      orderId,
      sessionId
    );
    
    // Step 4: Generate story with Tuisuan
    console.log('Generating tuisuan story...');
    const tuisuanData = await tuisuanAPI.generateStory(
      userIdNumber,
      orderId,
      sessionId,
    );
    
    // Step 5: Get processed events
    console.log('Getting processed events...');
    const processedEvents = await eventAPI.getProcessedEvents(
      tuisuanData.generated_story_text,
      tuisuanData.story_id,
      userIdNumber
    );

    // Step 6: Create events
    console.log('Creating events...');
    const createdEvents = await eventAPI.createEvents(processedEvents);
    console.log('Events created');

    return tuisuanData.story_id;
  } catch (error) {
    console.error('Error in story generation process:', error);
    throw error;
  }
};

// Event API endpoints
export const eventAPI = {
  // Get events for a story
  getEvents: async (userId: string, storyId: string): Promise<any[]> => {
    try {
      // Use the same API client with proper CORS handling
      const response = await apiClient.get(`/event?user_id=${userId}&story_ids=${storyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      // Return empty array instead of throwing to fail gracefully
      return [];
    }
  },

  getProcessedEvents: async (text: string, story_id: number, user_id: number): Promise<ProcessedEventData[]> => {
    try {
      const response = await apiClient.post(`/eventprocess`, {
        text: text,
        story_id: story_id,
        user_id: user_id,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching processed events:', error);
      throw error;
    }
  },

  createEvents: async (events: ProcessedEventData[]): Promise<EventData[]> => {
    try {
      const response = await apiClient.post('/event', events);
      return response.data;
    } catch (error) {
      console.error('Error creating events:', error);
      throw error;
    }
  },
};

// Export the API client for custom requests
export default apiClient; 
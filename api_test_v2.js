
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testData = {
  user: {
    username: 'testuser_v2',
    email: 'testuser_v2@example.com',
    password: 'password123',
    isSeller: true,
  },
  gig: {
    title: 'Test Gig V2',
    description: 'This is a test gig v2',
    category: 'Web Development',
    price: 150,
    deliveryTime: 2,
  },
  review: {
    rating: 4,
    comment: 'A good gig, but could be faster.',
  },
};

let authToken = '';
let userId = '';
let gigId = '';
let orderId = '';
let conversationId = '';
let reviewId = '';

const testRunner = async (testName, testFunction) => {
  try {
    await testFunction();
    console.log(`✅ ${testName}: PASSED`);
  } catch (error) {
    console.error(`❌ ${testName}: FAILED`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
};

const runApiTests = async () => {
  // Auth
  await testRunner('Register User', async () => {
    const response = await axios.post(`${API_URL}/auth/register`, testData.user);
    if (response.status !== 201 || !response.data.token) throw new Error('Registration failed');
    authToken = response.data.token;
    userId = response.data.user.id;
  });

  await testRunner('Login User', async () => {
    const response = await axios.post(`${API_URL}/auth/login`, { email: testData.user.email, password: testData.user.password });
    if (response.status !== 200 || !response.data.token) throw new Error('Login failed');
    authToken = response.data.token;
  });

  // Gigs
  await testRunner('Create Gig', async () => {
    const response = await axios.post(`${API_URL}/gigs`, testData.gig, { headers: { Authorization: `Bearer ${authToken}` } });
    if (response.status !== 201 || !response.data.gig) throw new Error('Create gig failed');
    gigId = response.data.gig._id;
  });

  await testRunner('Get Single Gig', async () => {
    const response = await axios.get(`${API_URL}/gigs/${gigId}`);
    if (response.status !== 200 || response.data._id !== gigId) throw new Error('Get single gig failed');
  });

  // Orders
  await testRunner('Create Order', async () => {
    const response = await axios.post(`${API_URL}/orders`, { gigId: gigId, paymentMethod: 'stripe' }, { headers: { Authorization: `Bearer ${authToken}` } });
    if (response.status !== 201 || !response.data.order) throw new Error('Create order failed');
    orderId = response.data.order._id;
  });

  // Messages
  await testRunner('Start Conversation', async () => {
    const response = await axios.post(`${API_URL}/messages/start-conversation`, { receiverId: userId, initialMessage: 'Hello from the test script!' }, { headers: { Authorization: `Bearer ${authToken}` } });
    if (response.status !== 201 || !response.data.conversationId) throw new Error('Start conversation failed');
    conversationId = response.data.conversationId;
  });

  await testRunner('Get Conversation Messages', async () => {
    const response = await axios.get(`${API_URL}/messages/conversations/${conversationId}`, { headers: { Authorization: `Bearer ${authToken}` } });
    if (response.status !== 200) throw new Error('Get conversation messages failed');
  });

  // Reviews
  await testRunner('Create Review', async () => {
    // First, we need to mark the order as completed. This logic is missing from the provided routes, so I'll assume a manual update for now.
    // In a real scenario, you'd have an endpoint to update the order status.
    await axios.put(`${API_URL}/orders/${orderId}`, { status: 'completed' }, { headers: { Authorization: `Bearer ${authToken}` } });

    const response = await axios.post(`${API_URL}/reviews`, { ...testData.review, gigId: gigId, orderId: orderId }, { headers: { Authorization: `Bearer ${authToken}` } });
    if (response.status !== 201 || !response.data.review) throw new Error('Create review failed');
    reviewId = response.data.review._id;
  });

  await testRunner('Get Gig Reviews', async () => {
    const response = await axios.get(`${API_URL}/reviews/gig/${gigId}`);
    if (response.status !== 200) throw new Error('Get gig reviews failed');
  });

  // Users
  await testRunner('Get User Profile', async () => {
    const response = await axios.get(`${API_URL}/users/profile`, { headers: { Authorization: `Bearer ${authToken}` } });
    if (response.status !== 200) throw new Error('Get user profile failed');
  });

  console.log('--- All tests completed ---');
};

runApiTests();


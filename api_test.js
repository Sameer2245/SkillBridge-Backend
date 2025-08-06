const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testUser1 = {
  username: 'testuser1',
  email: 'testuser1@example.com',
  password: 'password123',
  isSeller: true,
};

const testUser2 = {
  username: 'testuser2',
  email: 'testuser2@example.com',
  password: 'password123',
};

let user1 = {};
let user2 = {};
let gigId = '';
let orderId = '';
let conversationId = '';

let failedTests = [];
let totalTests = 0;

const testRunner = async (testName, testFunction, critical = false) => {
  totalTests++;
  try {
    const result = await testFunction();
    console.log(`✅ ${testName}: PASSED`);
    return result;
  } catch (error) {
    console.error(`❌ ${testName}: FAILED`);
    console.error(error.response ? error.response.data : error.message);
    failedTests.push(testName);
    
    // Stop execution if a critical test fails
    if (critical) {
      console.log(`Critical test failed. Stopping execution.`);
      process.exit(1);
    }
    
    return null;
  }
};

const registerOrLogin = async (userCredentials) => {
  try {
    // Try to login first
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: userCredentials.email,
      password: userCredentials.password,
    });
    return response.data;
  } catch (error) {
    // If login fails, register the user
    const response = await axios.post(`${API_URL}/auth/register`, userCredentials);
    return response.data;
  }
};


const runApiTests = async () => {
  // Auth
  user1 = await testRunner('Register or Login User 1', () => registerOrLogin(testUser1));
  user2 = await testRunner('Register or Login User 2', () => registerOrLogin(testUser2));


  await testRunner('Fetch User 1 Profile', async () => {
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${user1.token}` },
    });
    if (response.status !== 200 || !response.data) {
      throw new Error('Fetch user profile failed');
    }
  });

  // Gigs
  gigId = await testRunner('Create Gig', async () => {
    const response = await axios.post(
      `${API_URL}/gigs`,
      {
        title: 'Test Gig',
        description: 'This is a test gig for API testing purposes. It includes all required fields for proper functionality.',
        category: 'Programming & Tech',
        subcategory: 'Web Development',
        price: 100,
        deliveryTime: 3,
        revisions: 1,
        packages: {
            basic: {
                title: "Basic Package",
                description: "Basic web development package",
                price: 100,
                deliveryTime: 3,
                revisions: 1
            }
        },
        tags: ['web', 'development', 'test']
      },
      {
        headers: { Authorization: `Bearer ${user1.token}` },
      }
    );
    if (response.status !== 201 || !response.data) {
      throw new Error('Create gig failed');
    }
    return response.data.gig._id;
  });

  await testRunner('Get All Gigs', async () => {
    const response = await axios.get(`${API_URL}/gigs`);
    if (response.status !== 200) {
      throw new Error('Get all gigs failed');
    }
  });

  await testRunner('Get Single Gig', async () => {
    const response = await axios.get(`${API_URL}/gigs/details/${gigId}`);
    if (response.status !== 200 || response.data._id !== gigId) {
      throw new Error('Get single gig failed');
    }
  });

  // Orders (Only if gig was created successfully)
  if (gigId) {
    orderId = await testRunner('Create Order', async () => {
      const response = await axios.post(
        `${API_URL}/orders`,
        {
          gigId: gigId,
          packageType: 'basic',
          requirements: ['Please follow the requirements']
        },
        {
          headers: { Authorization: `Bearer ${user2.token}` },
        }
      );
      if (response.status !== 201 || !response.data) {
        throw new Error('Create order failed');
      }
      return response.data.order._id;
    });

    await testRunner('Get User Orders', async () => {
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${user2.token}` },
      });
      if (response.status !== 200) {
        throw new Error('Get user orders failed');
      }
    });
  }

  // Messages
  conversationId = await testRunner('Start Conversation', async () => {
    const response = await axios.post(
      `${API_URL}/messages/start-conversation`,
      {
        userId: user1.user.id,
        message: 'Hello, I would like to start a conversation'
      },
      {
        headers: { Authorization: `Bearer ${user2.token}` },
      }
    );
    if (response.status !== 200 || !response.data) {
      throw new Error('Start conversation failed');
    }
    return response.data.conversationId;
  });
  
  await testRunner('Send Message', async () => {
    const response = await axios.post(
      `${API_URL}/messages`,
      {
        receiverId: user1.user.id,
        message: 'Hello, this is a test message',
      },
      {
        headers: { Authorization: `Bearer ${user2.token}` },
      }
    );
    if (response.status !== 201 || !response.data) {
      throw new Error('Send message failed');
    }
  });

  await testRunner('Get Messages for Conversation', async () => {
    const response = await axios.get(`${API_URL}/messages/conversations/${conversationId}`, {
      headers: { Authorization: `Bearer ${user2.token}` },
    });
    if (response.status !== 200) {
      throw new Error('Get messages for conversation failed');
    }
  });

  // Reviews
  await testRunner('Create Review', async () => {
    const response = await axios.post(
      `${API_URL}/reviews`,
      {
        gigId: gigId,
        rating: 5,
        comment: 'This is a great gig!',
      },
      {
        headers: { Authorization: `Bearer ${user2.token}` },
      }
    );
    if (response.status !== 201 || !response.data) {
      throw new Error('Create review failed');
    }
  });

  await testRunner('Get Reviews for Gig', async () => {
    const response = await axios.get(`${API_URL}/reviews/gig/${gigId}`);
    if (response.status !== 200) {
      throw new Error('Get reviews for gig failed');
    }
  });

  // Users
  await testRunner('Get User Profile', async () => {
    const response = await axios.get(`${API_URL}/users/public/${user1.user.id}`, {
        headers: { Authorization: `Bearer ${user1.token}` },
    });
    if (response.status !== 200) {
      throw new Error('Get user profile failed');
    }
  });

  // Search
  await testRunner('Search Gigs', async () => {
    const response = await axios.get(`${API_URL}/search?q=test`);
    if (response.status !== 200) {
      throw new Error('Search gigs failed');
    }
  });

  // Notifications
  await testRunner('Get Notifications', async () => {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${user1.token}` },
    });
    if (response.status !== 200) {
      throw new Error('Get notifications failed');
    }
  });

  // Config
  await testRunner('Get Stripe Key', async () => {
    const response = await axios.get(`${API_URL}/config/stripe-key`);
    if (response.status !== 200 || !response.data.publishableKey) {
      throw new Error('Get Stripe key failed');
    }
  });

  // Cleanup
  await testRunner('Delete Gig', async () => {
    const response = await axios.delete(`${API_URL}/gigs/${gigId}`, {
        headers: { Authorization: `Bearer ${user1.token}` },
    });
    if (response.status !== 200) {
      throw new Error('Delete gig failed');
    }
  });
  
  console.log('\n--- All tests completed ---');
  console.log(`📈 Total tests: ${totalTests}`);
  console.log(`✅ Passed: ${totalTests - failedTests.length}`);
  console.log(`❌ Failed: ${failedTests.length}`);
  
  if (failedTests.length > 0) {
    console.log('\nFailed tests:');
    failedTests.forEach(test => console.log(`  - ${test}`));
  } else {
    console.log('🎉 All API endpoints are working correctly!');
  }
};

runApiTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});


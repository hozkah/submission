const axios = require('axios');

async function testNotifications() {
  try {
    console.log('Testing notifications endpoint...');
    
    // Test without authentication first to see if the endpoint is reachable
    try {
      const response = await axios.get('http://localhost:5000/api/incidents/notifications');
      console.log('Unexpected success without auth:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Endpoint is reachable, authentication required (expected)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    // Test the unread count endpoint
    try {
      const response = await axios.get('http://localhost:5000/api/incidents/notifications/unread');
      console.log('Unexpected success without auth:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Unread endpoint is reachable, authentication required (expected)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNotifications();

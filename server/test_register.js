const axios = require('axios');

async function testRegister() {
    try {
        const res = await axios.post('http://localhost:3000/api/auth/register', {
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            name: 'Test User',
            role: 'CANDIDATE'
        });
        console.log('Register Success:', res.data);
    } catch (error) {
        console.error('Register Failed:', error.response ? error.response.data : error.message);
    }
}

testRegister();

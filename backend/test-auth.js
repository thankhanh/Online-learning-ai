const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';
let token = '';

async function testAuth() {
    console.log('--- Starting Auth Flow Test ---');

    try {
        // 1. Register
        console.log('\n1. Testing Registration...');
        const regRes = await axios.post(`${API_URL}/register`, {
            name: 'Auth Test User',
            email: `test_${Date.now()}@example.com`,
            password: 'password123',
            role: 'student'
        });
        console.log('✅ Registration Success:', regRes.data.success);
        token = regRes.data.token;

        // 2. Login
        console.log('\n2. Testing Login...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: regRes.data.user.email,
            password: 'password123'
        });
        console.log('✅ Login Success:', loginRes.data.success);
        token = loginRes.data.token;

        // 3. Get Me
        console.log('\n3. Testing Get Me...');
        const meRes = await axios.get(`${API_URL}/me`, {
            headers: { 'x-auth-token': token }
        });
        console.log('✅ Get Me Success:', meRes.data.success);
        console.log('User Name:', meRes.data.user.name);

        // 4. Update Profile
        console.log('\n4. Testing Update Profile...');
        const updateRes = await axios.put(`${API_URL}/profile`, {
            displayName: 'Updated Name'
        }, {
            headers: { 'x-auth-token': token }
        });
        console.log('✅ Update Success:', updateRes.data.success);
        console.log('New Display Name:', updateRes.data.user.displayName);

        // 5. Logout
        console.log('\n5. Testing Logout...');
        const logoutRes = await axios.post(`${API_URL}/logout`, {}, {
            headers: { 'x-auth-token': token }
        });
        console.log('✅ Logout Success:', logoutRes.data.success);

        // 6. Test Protected Route with invalid token
        console.log('\n6. Testing Middleware (Invalid Token)...');
        try {
            await axios.get(`${API_URL}/me`, {
                headers: { 'x-auth-token': 'invalid-token' }
            });
        } catch (err) {
            console.log('✅ Middleware Success (Caught expected error):', err.response.data.message);
        }

        console.log('\n--- All Auth Tests Passed! ---');
    } catch (error) {
        console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

testAuth();

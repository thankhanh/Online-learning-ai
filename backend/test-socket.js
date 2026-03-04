const io = require('socket.io-client');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function testAntiCheat() {
    console.log('--- Starting Anti-Cheat Socket Test ---');

    try {
        // 1. Setup Data (Lecturer, Class, Exam with 2 max violations)
        console.log('\n1. Setting up Test Data...');
        const lEmail = `l_socket_${Date.now()}@test.com`;
        await axios.post(`${API_URL}/auth/register`, { name: 'S-Lecturer', email: lEmail, password: 'password123', role: 'lecturer' });
        const lLogin = await axios.post(`${API_URL}/auth/login`, { email: lEmail, password: 'password123' });
        const lToken = lLogin.data.token;
        const lUserId = lLogin.data.user.id;

        const classRes = await axios.post(`${API_URL}/classrooms`, { name: 'Socket Class' }, { headers: { 'x-auth-token': lToken } });
        const classId = classRes.data.classroom._id;
        const joinCode = classRes.data.classroom.code;

        const examRes = await axios.post(`${API_URL}/exams`, {
            title: 'Socket Exam',
            classroom: classId,
            duration: 5,
            questions: [{ questionText: 'Q1', options: ['A', 'B'], correctAnswer: 'A' }],
            maxViolations: 2 // Set low for testing
        }, { headers: { 'x-auth-token': lToken } });
        const examId = examRes.data.exam._id;
        console.log('✅ Exam created with maxViolations: 2');

        // 2. Setup Student
        const sEmail = `s_socket_${Date.now()}@test.com`;
        await axios.post(`${API_URL}/auth/register`, { name: 'S-Student', email: sEmail, password: 'password123', role: 'student' });
        const sLogin = await axios.post(`${API_URL}/auth/login`, { email: sEmail, password: 'password123' });
        const sToken = sLogin.data.token;
        const sUserId = sLogin.data.user.id;
        await axios.post(`${API_URL}/classrooms/join`, { code: joinCode }, { headers: { 'x-auth-token': sToken } });
        console.log('✅ Student ready and joined class');

        // 3. Connect Socket
        console.log('\n2. Connecting to Socket Server...');
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('✅ Socket connected. ID:', socket.id);

            // Join Exam
            socket.emit('join-exam', { examId, userId: sUserId });
        });

        socket.on('violation-update', (data) => {
            console.log('🔔 Received violation-update:', data);
        });

        socket.on('auto-submit-triggered', (data) => {
            console.log('🚨 Received auto-submit-triggered:', data.message);
            console.log('Final Violation Count:', data.totalViolations);

            if (data.totalViolations === 2) {
                console.log('\n🏆 SOCKET ANTI-CHEAT TEST PASSED!');
            } else {
                console.error('\n❌ SOCKET ANTI-CHEAT TEST FAILED! Expected 2 violations.');
            }
            socket.disconnect();
            process.exit(0);
        });

        // Trigger Violations after join
        setTimeout(() => {
            console.log('\n3. Triggering Violation 1 (Tab Switch)...');
            socket.emit('violation', { type: 'tab-switch', examId, userId: sUserId });

            setTimeout(() => {
                console.log('\n4. Triggering Violation 2 (Window Blur) - Should trigger Auto-Submit...');
                socket.emit('violation', { type: 'window-blur', examId, userId: sUserId });
            }, 1000);
        }, 1500);

        // Timeout fallback
        setTimeout(() => {
            console.error('❌ Test timed out!');
            process.exit(1);
        }, 10000);

    } catch (error) {
        console.error('❌ Test Setup Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

testAntiCheat();

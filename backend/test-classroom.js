const axios = require('axios');

const AUTH_URL = 'http://localhost:5000/api/auth';
const CLASS_URL = 'http://localhost:5000/api/classrooms';

async function testClassroom() {
    console.log('--- Starting Classroom Flow Test ---');

    try {
        // 1. Register/Login as Lecturer
        console.log('\n1. Logging in as Lecturer...');
        const lecturerEmail = `lecturer_${Date.now()}@test.com`;
        await axios.post(`${AUTH_URL}/register`, {
            name: 'Lecturer User',
            email: lecturerEmail,
            password: 'password123',
            role: 'lecturer'
        });
        const lLoginRes = await axios.post(`${AUTH_URL}/login`, {
            email: lecturerEmail,
            password: 'password123'
        });
        const lToken = lLoginRes.data.token;
        console.log('✅ Lecturer Logged In');

        // 2. Create Classroom
        console.log('\n2. Creating Classroom...');
        const createRes = await axios.post(`${CLASS_URL}`, {
            name: 'Advanced AI Course',
            description: 'Mastering RAG and LLMs'
        }, {
            headers: { 'x-auth-token': lToken }
        });
        console.log('✅ Classroom Created:', createRes.data.classroom.name);
        console.log('Join Code:', createRes.data.classroom.code);
        const classId = createRes.data.classroom._id;
        const joinCode = createRes.data.classroom.code;

        // 3. Register/Login as Student
        console.log('\n3. Logging in as Student...');
        const studentEmail = `student_${Date.now()}@test.com`;
        await axios.post(`${AUTH_URL}/register`, {
            name: 'Student User',
            email: studentEmail,
            password: 'password123',
            role: 'student'
        });
        const sLoginRes = await axios.post(`${AUTH_URL}/login`, {
            email: studentEmail,
            password: 'password123'
        });
        const sToken = sLoginRes.data.token;
        console.log('✅ Student Logged In');

        // 4. Join Classroom
        console.log('\n4. Student Joining Classroom...');
        const joinRes = await axios.post(`${CLASS_URL}/join`, {
            code: joinCode
        }, {
            headers: { 'x-auth-token': sToken }
        });
        console.log('✅ Joined Success:', joinRes.data.success);

        // 5. Verify Student in Classroom (Lecturer view)
        console.log('\n5. Verifying enrollment (Lecturer View)...');
        const verifyRes = await axios.get(`${CLASS_URL}/${classId}`, {
            headers: { 'x-auth-token': lToken }
        });
        console.log('✅ Students in class:', verifyRes.data.classroom.students.length);
        console.log('Student List:', verifyRes.data.classroom.students.map(s => s.name));

        console.log('\n--- All Classroom Tests Passed! ---');
    } catch (error) {
        console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

testClassroom();

const axios = require('axios');

const AUTH_URL = 'http://localhost:5000/api/auth';
const CLASS_URL = 'http://localhost:5000/api/classrooms';
const EXAM_URL = 'http://localhost:5000/api/exams';

async function testExamFlow() {
    console.log('--- Starting Exam Flow Test ---');

    try {
        // 1. Setup Lecturer and Classroom
        console.log('\n1. Setting up Lecturer and Classroom...');
        const lecturerEmail = `lecturer_exam_${Date.now()}@test.com`;
        await axios.post(`${AUTH_URL}/register`, {
            name: 'Exam Lecturer',
            email: lecturerEmail,
            password: 'password123',
            role: 'lecturer'
        });
        const lLogin = await axios.post(`${AUTH_URL}/login`, { email: lecturerEmail, password: 'password123' });
        const lToken = lLogin.data.token;

        const classRes = await axios.post(`${CLASS_URL}`, { name: 'Exam Test Class' }, { headers: { 'x-auth-token': lToken } });
        const classId = classRes.data.classroom._id;
        const joinCode = classRes.data.classroom.code;
        console.log('✅ Classroom ready. ID:', classId);

        // 2. Create Exam
        console.log('\n2. Creating Exam (2 Questions)...');
        const examRes = await axios.post(`${EXAM_URL}`, {
            title: 'AI Fundamentals Quiz',
            classroom: classId,
            duration: 10,
            questions: [
                {
                    questionText: 'What does RAG stand for?',
                    options: ['Random Access Grid', 'Retrieval Augmented Generation', 'Real-time AI Graph'],
                    correctAnswer: 'Retrieval Augmented Generation'
                },
                {
                    questionText: 'Is Ollama used for running LLMs locally?',
                    options: ['Yes', 'No'],
                    correctAnswer: 'Yes'
                }
            ]
        }, { headers: { 'x-auth-token': lToken } });
        const examId = examRes.data.exam._id;
        console.log('✅ Exam created. ID:', examId);

        // 3. Setup Student and Join Class
        console.log('\n3. Setting up Student and Joining Class...');
        const studentEmail = `student_exam_${Date.now()}@test.com`;
        await axios.post(`${AUTH_URL}/register`, {
            name: 'Exam Student',
            email: studentEmail,
            password: 'password123',
            role: 'student'
        });
        const sLogin = await axios.post(`${AUTH_URL}/login`, { email: studentEmail, password: 'password123' });
        const sToken = sLogin.data.token;

        await axios.post(`${CLASS_URL}/join`, { code: joinCode }, { headers: { 'x-auth-token': sToken } });
        console.log('✅ Student joined class');

        // 4. Submit Exam
        console.log('\n4. Submitting Exam (One Correct, One Wrong)...');
        // Q1: Correct, Q2: Wrong ('No')
        const submitRes = await axios.post(`${EXAM_URL}/${examId}/submit`, {
            answers: [
                { questionId: examRes.data.exam.questions[0]._id, selectedOption: 'Retrieval Augmented Generation' },
                { questionId: examRes.data.exam.questions[1]._id, selectedOption: 'No' }
            ]
        }, { headers: { 'x-auth-token': sToken } });

        console.log('✅ Exam Submitted');
        console.log('Calculated Score:', submitRes.data.score); // Expected: (1/2) * 10 = 5.00
        console.log('Correct Count:', submitRes.data.correctCount);

        if (submitRes.data.score == '5.00') {
            console.log('🏆 SCORE VERIFICATION PASSED!');
        } else {
            console.error('❌ SCORE VERIFICATION FAILED! Expected 5.00, got:', submitRes.data.score);
        }

        // 5. Verify Results (Lecturer View)
        console.log('\n5. Verifying Results (Lecturer View)...');
        const resultsRes = await axios.get(`${EXAM_URL}/${examId}/results`, { headers: { 'x-auth-token': lToken } });
        console.log('✅ Results found:', resultsRes.data.results.length);
        console.log('Student Score in DB:', resultsRes.data.results[0].score);

        console.log('\n--- All Exam Core Tests Passed! ---');
    } catch (error) {
        console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

testExamFlow();

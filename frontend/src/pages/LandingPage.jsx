import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Video, Zap, Shield, Cpu, MessageSquare, ArrowRight, Star, CheckCircle2 } from 'lucide-react';
import { Button, Container, Row, Col, Badge, Card } from 'react-bootstrap';

const LandingPage = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const features = [
        {
            icon: <Video className="text-primary" size={32} />,
            title: "Lớp học Ảo Real-time",
            description: "Trải nghiệm học tập trực tuyến mượt mà với công nghệ WebRTC hiện đại, hỗ trợ tương tác tức thì giữa giảng viên và sinh viên."
        },
        {
            icon: <Cpu className="text-info" size={32} />,
            title: "Trợ lý AI Thông thái",
            description: "Hệ thống RAG (Retrieval-Augmented Generation) giúp bạn giải đáp mọi thắc mắc dựa trên chính tài liệu bài giảng của mình."
        },
        {
            icon: <Shield className="text-danger" size={32} />,
            title: "Thi cử Chống Gian lận",
            description: "Công nghệ giám sát tiên tiến phát hiện các hành vi bất thường, đảm bảo tính công bằng tuyệt đối cho mọi kỳ thi trực tuyến."
        },
        {
            icon: <Zap className="text-warning" size={32} />,
            title: "Tạo Đề thi Tự động",
            description: "Giảng viên có thể tạo đề thi chất lượng chỉ trong vài giây nhờ sức mạnh của AI, tiết kiệm tối đa thời gian soạn bài."
        }
    ];

    return (
        <div className="landing-wrapper overflow-hidden bg-white">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-3">
                <Container>
                    <Link to="/" className="navbar-brand fw-900 fs-4 text-primary d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-2">
                            <BookOpen size={24} />
                        </div>
                        Antigravity E-Learning
                    </Link>
                    <div className="ms-auto d-flex gap-2">
                        <Link to="/login">
                            <Button variant="link" className="text-dark fw-700 text-decoration-none px-4">Đăng nhập</Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="primary" className="rounded-pill px-4 fw-800 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)' }}>Tham gia ngay</Button>
                        </Link>
                    </div>
                </Container>
            </nav>

            {/* Hero Section */}
            <section className="hero-area pt-5 pb-5 position-relative">
                <div className="position-absolute top-0 start-0 w-100 h-100 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <Container className="position-relative z-1">
                    <Row className="align-items-center gy-5">
                        <Col lg={6}>
                            <motion.div 
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Badge bg="primary" className="bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-700 mb-4 border border-primary border-opacity-10">
                                    <Star size={14} className="me-2 fill-primary" /> Nền tảng Giáo dục 4.0
                                </Badge>
                                <h1 className="display-4 fw-900 text-dark mb-3" style={{ letterSpacing: '-0.04em', lineHeight: '1.1' }}>
                                    Kiến tạo tương lai cùng <span className="text-primary" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Trí tuệ nhân tạo</span>
                                </h1 >
                                <p className="lead text-muted fw-500 mb-5" style={{ fontSize: '1.25rem' }}>
                                    Hệ thống quản lý học tập tích hợp AI toàn diện nhất dành cho các tổ chức giáo dục hiện đại. Tương tác thật, học tập thật, chất lượng thật.
                                </p>
                                <div className="d-flex flex-wrap gap-3">
                                    <Link to="/register">
                                        <Button variant="primary" className="rounded-pill px-5 py-3 fw-800 shadow-lg border-0 d-flex align-items-center bg-gradient-premium">
                                            Bắt đầu miễn phí <ArrowRight size={20} className="ms-2" />
                                        </Button>
                                    </Link>
                                    <Link to="/login">
                                        <Button variant="outline-dark" className="rounded-pill px-5 py-3 fw-800 border-2">Khám phá lớp học</Button>
                                    </Link>
                                </div>
                                <div className="mt-5 d-flex align-items-center gap-4">
                                    <div className="d-flex align-items-center text-muted fw-600 small">
                                        <CheckCircle2 size={18} className="text-success me-2" /> Bảo mật & Tin cậy
                                    </div>
                                    <div className="d-flex align-items-center text-muted fw-600 small">
                                        <CheckCircle2 size={18} className="text-success me-2" /> Hỗ trợ AI 24/7
                                    </div>
                                </div>
                            </motion.div>
                        </Col>
                        <Col lg={6}>
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="ps-lg-5"
                            >
                                <div className="position-relative">
                                    <div className="bg-primary rounded-4 shadow-premium p-2 overflow-hidden" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', boxSizing: 'content-box' }}>
                                        <img 
                                            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                                            alt="E-Learning Dashboard" 
                                            className="img-fluid rounded-3 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Section */}
            <section className="features-area py-5 bg-light bg-opacity-30">
                <Container className="py-5">
                    <div className="text-center mb-5 pb-3">
                        <h2 className="fw-900 text-dark mb-3" style={{ fontSize: '2.5rem', letterSpacing: '-0.03em' }}>Trải nghiệm tuyệt vời với các tính năng</h2>
                        <p className="text-muted mx-auto fw-500" style={{ maxWidth: '600px' }}>Mang đến sức mạnh của Trí tuệ nhân tạo vào từng buổi học, giúp tối ưu hóa hiệu quả giảng dạy và kích thích sự sáng tạo.</p>
                    </div>
                    <Row className="g-4">
                        {features.map((f, idx) => (
                            <Col md={6} lg={3} key={idx}>
                                <motion.div
                                    whileHover={{ y: -10 }}
                                    className="h-100"
                                >
                                    <Card className="h-100 border-0 shadow-sm rounded-4 p-3 hover-shadow-md transition-fast">
                                        <Card.Body>
                                            <div className="bg-light p-3 rounded-4 d-inline-flex mb-4">
                                                {f.icon}
                                            </div>
                                            <h5 className="fw-800 text-dark mb-3">{f.title}</h5>
                                            <p className="text-muted small fw-500 line-height-relaxed">{f.description}</p>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* AI Tutor Callout */}
            <section className="ai-callout py-5">
                <Container className="py-5">
                    <div className="bg-dark rounded-5 p-5 text-white overflow-hidden position-relative shadow-premium" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                        <div className="position-absolute top-0 end-0 opacity-10" style={{ transform: 'translate(20%, -20%)' }}>
                            <Cpu size={300} />
                        </div>
                        <Row className="align-items-center position-relative z-1 g-5">
                            <Col lg={7}>
                                <h2 className="display-5 fw-900 mb-4" style={{ letterSpacing: '-0.03em' }}>Trợ lý AI được huấn luyện trên chính tài liệu bài giảng của bạn</h2>
                                <p className="lead mb-5 opacity-75 fw-500" style={{ fontSize: '1.2rem' }}>Không chỉ là một AI chung chung, chúng tôi cung cấp ChatGPT cá nhân hóa cho từng môn học. Tải lên tài liệu PDF hoặc bài giảng, AI sẽ hỗ trợ bạn trả lời mọi câu hỏi dựa trên nội dung đó.</p>
                                <div className="d-flex gap-3">
                                    <Badge bg="light" className="text-dark p-2 px-3 rounded-pill fw-800 border-0">
                                        <MessageSquare size={16} className="me-2 text-primary" /> RAG Technology
                                    </Badge>
                                    <Badge bg="light" className="text-dark p-2 px-3 rounded-pill fw-800 border-0">
                                        <Shield size={16} className="me-2 text-danger" /> 100% Privacy
                                    </Badge>
                                </div>
                            </Col>
                            <Col lg={5} className="text-center">
                                <motion.div 
                                    animate={{ scale: [1, 1.05, 1] }} 
                                    transition={{ repeat: Infinity, duration: 4 }}
                                    className="bg-primary bg-opacity-20 rounded-circle p-4 d-inline-block border border-primary border-opacity-30"
                                >
                                    <div className="bg-primary bg-opacity-20 rounded-circle p-4 d-inline-block border border-primary border-opacity-30">
                                        <div className="bg-primary text-white p-5 rounded-circle shadow-lg">
                                            <MessageSquare size={64} />
                                        </div>
                                    </div>
                                </motion.div>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </section>

            {/* Footer */}
            <footer className="footer py-5 border-top bg-light">
                <Container>
                    <Row className="gy-4">
                        <Col lg={4}>
                            <div className="fw-900 fs-4 text-primary d-flex align-items-center mb-3">
                                Antigravity E-Learning
                            </div>
                            <p className="text-muted fw-500 mb-4">Nền tảng giáo dục trực tuyến đột phá tích hợp Trí tuệ nhân tạo, mang lại trải nghiệm học tập đỉnh cao.</p>
                        </Col>
                        <Col lg={2} md={4} className="ms-lg-auto">
                            <h6 className="fw-800 text-dark mb-4">Sản phẩm</h6>
                            <ul className="list-unstyled text-muted fw-600 small d-flex flex-column gap-3">
                                <li>Phòng học ảo</li>
                                <li>Hệ thống bài thi</li>
                                <li>Quản lý học liệu</li>
                                <li>Trợ lý AI</li>
                            </ul>
                        </Col>
                        <Col lg={2} md={4}>
                            <h6 className="fw-800 text-dark mb-4">Môn học</h6>
                            <ul className="list-unstyled text-muted fw-600 small d-flex flex-column gap-3">
                                <li>Khoa học máy tính</li>
                                <li>Ngôn ngữ học</li>
                                <li>Kinh tế xã hội</li>
                                <li>Nghệ thuật</li>
                            </ul>
                        </Col>
                        <Col lg={2} md={4}>
                            <h6 className="fw-800 text-dark mb-4">Cung cấp</h6>
                            <ul className="list-unstyled text-muted fw-600 small d-flex flex-column gap-3">
                                <li>Hỗ trợ 24/7</li>
                                <li>Điều khoản</li>
                                <li>Bảo mật</li>
                                <li>Liên hệ</li>
                            </ul>
                        </Col>
                    </Row>
                    <div className="mt-5 pt-4 border-top text-center text-muted small fw-600">
                        &copy; {new Date().getFullYear()} Antigravity AI Learning. Phát triển bởi Đề án Cuối khóa Nhóm 4.
                    </div>
                </Container>
            </footer>
        </div>
    );
};

// Internal icons helper for missing lucide imports
const Users = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

export default LandingPage;

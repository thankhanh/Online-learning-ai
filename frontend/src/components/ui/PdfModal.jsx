import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

const PdfModal = ({ show, onHide, pdfUrl, title }) => {
    const [blobUrl, setBlobUrl] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    const getBaseUrl = () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        return apiUrl.replace(/\/api$/, '') || apiUrl.replace('/api/', '');
    };

    const fullUrl = pdfUrl?.startsWith('http') 
        ? pdfUrl 
        : `${getBaseUrl()}${pdfUrl?.startsWith('/') ? '' : '/'}${pdfUrl}`;

    React.useEffect(() => {
        if (show && fullUrl) {
            fetchPdf();
        }
        return () => {
            if (blobUrl) {
                window.URL.revokeObjectURL(blobUrl);
                setBlobUrl(null);
            }
        };
    }, [show, fullUrl]);

    const fetchPdf = async () => {
        setLoading(true);
        try {
            const response = await fetch(fullUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            setBlobUrl(url);
        } catch (error) {
            console.error('Failed to fetch PDF for preview:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (e) => {
        e.preventDefault();
        if (!blobUrl) return;
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', pdfUrl.split('/').pop() || 'document.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            size="xl" 
            centered 
            contentClassName="border-0 shadow-premium rounded-4 overflow-hidden"
            className="pdf-preview-modal"
        >
            <Modal.Header className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
                <Modal.Title className="fw-800 text-dark d-flex align-items-center" style={{ fontSize: '1.1rem' }}>
                    <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-2 me-3 d-flex align-items-center justify-content-center">
                        <FileText size={20} />
                    </div>
                    <span className="text-truncate" style={{ maxWidth: '400px' }}>{title || 'Xem tài liệu'}</span>
                </Modal.Title>
                <div className="d-flex gap-2">
                    <a 
                        href={fullUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-light btn-sm rounded-pill px-3 fw-600 d-none d-md-flex align-items-center"
                    >
                        <ExternalLink size={16} className="me-2" /> Mở tab mới
                    </a>
                    <Button 
                        variant="primary" 
                        size="sm" 
                        className="rounded-pill px-3 fw-600 d-flex align-items-center"
                        onClick={handleDownload}
                        disabled={loading || !blobUrl}
                    >
                        <Download size={16} className="me-2" /> Tải xuống
                    </Button>
                    <Button 
                        variant="white" 
                        className="rounded-circle p-2 ms-2 border-0 hover-bg-light"
                        onClick={onHide}
                    >
                        <X size={20} />
                    </Button>
                </div>
            </Modal.Header>
            <Modal.Body className="p-0 bg-secondary bg-opacity-10" style={{ height: '80vh' }}>
                {loading ? (
                    <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                        <div className="spinner-border text-primary mb-3" role="status"></div>
                        <p className="fw-600">Đang chuẩn bị tài liệu...</p>
                    </div>
                ) : blobUrl ? (
                    <object 
                        data={`${blobUrl}#toolbar=0&navpanes=0`} 
                        type="application/pdf"
                        width="100%" 
                        height="100%" 
                        className="border-0 shadow-sm"
                    >
                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted p-5 text-center">
                            <FileText size={48} className="mb-3 opacity-20" />
                            <p className="fw-600">Trình duyệt không thể hiển thị bản xem trước trực tiếp.</p>
                            <p className="small mb-4">Vui lòng sử dụng nút "Mở tab mới" hoặc "Tải xuống" để xem tài liệu.</p>
                            <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
                                <ExternalLink size={18} className="me-2" /> Mở trong tab mới
                            </a>
                        </div>
                    </object>
                ) : (
                    <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                        <X size={48} className="mb-3 opacity-20" />
                        <p className="fw-600">Không thể tải bản xem trước tài liệu.</p>
                        <Button variant="link" size="sm" onClick={fetchPdf}>Thử lại</Button>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default PdfModal;

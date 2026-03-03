import LoginFeature from '../features/auth/Login';

const Login = ({ onLoginSuccess }) => {
    return <LoginFeature onLoginSuccess={onLoginSuccess} />;
};

export default Login;

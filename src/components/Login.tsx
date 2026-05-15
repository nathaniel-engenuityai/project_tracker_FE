import { signInWithGoogle } from '../firebase';

const Login = () => {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ margin: '0 0 8px', fontSize: '28px' }}>Project Tracker</h1>
        <p style={{ margin: '0 0 32px', color: '#666', fontSize: '15px' }}>
          Track your assignments and projects
        </p>
        <button onClick={handleLogin} style={googleBtn}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width={20}
            height={20}
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f5f5f5',
  fontFamily: 'system-ui, sans-serif',
};

const cardStyle: React.CSSProperties = {
  background: '#fff',
  padding: '48px',
  borderRadius: '16px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  textAlign: 'center',
  maxWidth: '400px',
  width: '100%',
};

const googleBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 24px',
  background: '#fff',
  border: '1px solid #ddd',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 500,
  margin: '0 auto',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
};

export default Login;
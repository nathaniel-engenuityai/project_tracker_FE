import { useState, useRef } from 'react';
import type { User } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { uploadAvatar } from '../api/projects';

interface Props {
  user: User;
}

const Avatar = ({ user }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const url = await uploadAvatar(file);
      await updateProfile(auth.currentUser!, { photoURL: url });
      window.location.reload();
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={() => fileInputRef.current?.click()}
        style={avatarStyle}
        title="Click to change profile picture"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt="Profile"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: '18px', color: '#fff', fontWeight: 600 }}>
            {user.displayName?.[0]?.toUpperCase() || 'U'}
          </span>
        )}
        <div style={overlayStyle}>
          {uploading ? '...' : '📷'}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {error && (
        <p style={{ position: 'absolute', top: '44px', left: 0, fontSize: '11px', color: '#e74c3c', whiteSpace: 'nowrap' }}>
          {error}
        </p>
      )}
    </div>
  );
};

const avatarStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: '#4f46e5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  overflow: 'hidden',
  position: 'relative',
  border: '2px solid #e0e0e0',
};

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.2s',
  fontSize: '16px',
};

export default Avatar;
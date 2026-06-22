import { useState, useRef, useEffect } from 'react';
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
  const [hovered, setHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic client-side validation
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      errorTimeoutRef.current = setTimeout(() => setError(null), 5000);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      errorTimeoutRef.current = setTimeout(() => setError(null), 5000);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // uploadAvatar sends user.uid as userId — BE stores under users/<uid>/avatar.*
      const url = await uploadAvatar(file);
      await updateProfile(auth.currentUser!, { photoURL: url });
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed.';
      setError(message);
      errorTimeoutRef.current = setTimeout(() => setError(null), 6000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={avatarStyle}
        title="Click to change profile picture"
        role="button"
        aria-label="Change profile picture"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName ?? 'Profile'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: '18px', color: '#fff', fontWeight: 600 }}>
            {user.displayName?.[0]?.toUpperCase() ?? 'U'}
          </span>
        )}
        <div style={{ ...overlayStyle, opacity: hovered || uploading ? 1 : 0 }}>
          {uploading ? '…' : '📷'}
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
        <p
          style={{
            position: 'absolute',
            top: '44px',
            left: 0,
            fontSize: '11px',
            color: '#e74c3c',
            whiteSpace: 'nowrap',
            margin: 0,
            background: '#fff',
            padding: '2px 4px',
            borderRadius: '4px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            zIndex: 10,
          }}
        >
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
  flexShrink: 0,
};

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'opacity 0.2s',
  fontSize: '16px',
};

export default Avatar;

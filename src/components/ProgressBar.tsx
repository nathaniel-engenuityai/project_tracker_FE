interface Props {
  estimatedHours: number;
  loggedHours: number;
}

const ProgressBar = ({ estimatedHours, loggedHours }: Props) => {
  const percentage = Math.min(
    Math.round((loggedHours / estimatedHours) * 100),
    100
  );

  const getColor = () => {
    if (percentage >= 100) return '#e74c3c';
    if (percentage >= 75) return '#e67e22';
    return '#2ecc71';
  };

  return (
    <div style={{ marginTop: '8px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '13px',
          marginBottom: '4px',
        }}
      >
        <span>{loggedHours}h logged</span>
        <span>
          {percentage}% of {estimatedHours}h
        </span>
      </div>
      <div
        style={{
          background: '#e0e0e0',
          borderRadius: '999px',
          height: '10px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            background: getColor(),
            height: '100%',
            borderRadius: '999px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      {percentage >= 100 && (
        <p style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
          ⚠ Over estimate by {loggedHours - estimatedHours}h
        </p>
      )}
    </div>
  );
};

export default ProgressBar;
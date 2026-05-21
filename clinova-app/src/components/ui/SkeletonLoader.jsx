import React from 'react';
import './ui.css'; // We will create this for basic animations

export default function SkeletonLoader({ type = 'card', count = 1, style = {} }) {
  const renderSkeleton = (index) => {
    switch (type) {
      case 'profile':
        return (
          <div key={index} className="skeleton-container" style={{ display: 'flex', alignItems: 'center', gap: '16px', ...style }}>
            <div className="skeleton pulse" style={{ width: '64px', height: '64px', borderRadius: '50%' }}></div>
            <div style={{ flex: 1 }}>
              <div className="skeleton pulse" style={{ height: '20px', width: '60%', marginBottom: '8px', borderRadius: '4px' }}></div>
              <div className="skeleton pulse" style={{ height: '14px', width: '40%', borderRadius: '4px' }}></div>
            </div>
          </div>
        );
      case 'list-item':
        return (
          <div key={index} className="skeleton-container" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid #E5E7EB', ...style }}>
            <div className="skeleton pulse" style={{ width: '40px', height: '40px', borderRadius: '12px' }}></div>
            <div style={{ flex: 1 }}>
              <div className="skeleton pulse" style={{ height: '16px', width: '50%', marginBottom: '6px', borderRadius: '4px' }}></div>
              <div className="skeleton pulse" style={{ height: '12px', width: '30%', borderRadius: '4px' }}></div>
            </div>
          </div>
        );
      case 'card':
      default:
        return (
          <div key={index} className="skeleton-container card" style={{ padding: '20px', marginBottom: '16px', ...style }}>
            <div className="skeleton pulse" style={{ height: '24px', width: '40%', marginBottom: '16px', borderRadius: '6px' }}></div>
            <div className="skeleton pulse" style={{ height: '16px', width: '100%', marginBottom: '8px', borderRadius: '4px' }}></div>
            <div className="skeleton pulse" style={{ height: '16px', width: '80%', borderRadius: '4px' }}></div>
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => renderSkeleton(i))}
    </>
  );
}

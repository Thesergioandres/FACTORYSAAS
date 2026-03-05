import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function TopLoadingBar() {
  const location = useLocation();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setWidth(0);

    const start = window.setTimeout(() => setWidth(70), 50);
    const end = window.setTimeout(() => setWidth(100), 320);
    const hide = window.setTimeout(() => setVisible(false), 700);

    return () => {
      window.clearTimeout(start);
      window.clearTimeout(end);
      window.clearTimeout(hide);
    };
  }, [location.pathname]);

  return (
    <div
      className="top-loading-bar"
      style={{ width: `${width}%`, opacity: visible ? 1 : 0 }}
    />
  );
}

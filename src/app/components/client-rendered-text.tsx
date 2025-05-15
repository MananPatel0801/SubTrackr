
'use client';

import { useState, useEffect, type ReactNode } from 'react';

interface ClientRenderedTextProps {
  children: ReactNode;
  placeholder?: ReactNode;
}

const ClientRenderedText: React.FC<ClientRenderedTextProps> = ({ children, placeholder = null }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return <>{isClient ? children : placeholder}</>;
};

export default ClientRenderedText;

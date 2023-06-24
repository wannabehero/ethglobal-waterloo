import { useContext } from 'react';
import { XMTPContext } from '../contexts/xmtpContext';

const useXMTPClient = () => {
  return useContext(XMTPContext);
};

export default useXMTPClient;

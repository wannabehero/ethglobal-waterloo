import { HStack, Image, Link } from '@chakra-ui/react';

import github from '../assets/github.png';
import polygonLogo from '../assets/polygon.svg';
import goerliLogo from '../assets/goerli.png';
import gnosisLogo from '../assets/gnosis.png';
import { ZBAY_DEPLOMENTS } from '../web3/consts';
import { gnosis, goerli, polygonMumbai } from 'wagmi/chains';

const Footer = () => (
  <HStack py="16px" spacing="12px" justifyContent="center">
    {/* <Link target="_blank" href={`https://testnet-zkevm.polygonscan.com/address/${ZBAY_DEPLOMENTS[polygonZkEvmTestnet.id]}`}>
      <Image src={zkevmLogo} alt="zkEvm" boxSize="30px" />
    </Link> */}
    <Link target="_blank" href={`https://mumbai.polygonscan.com/address/${ZBAY_DEPLOMENTS[polygonMumbai.id]}`}>
      <Image src={polygonLogo} alt="Polygon" boxSize="30px" />
    </Link>
    <Link target="_blank" href={`https://goerli.etherscan.io/address/${ZBAY_DEPLOMENTS[goerli.id]}`}>
      <Image src={goerliLogo} alt="Goerli" boxSize="30px" />
    </Link>
    <Link target="_blank" href={`https://gnosisscan.io/address/${ZBAY_DEPLOMENTS[gnosis.id]}`}>
      <Image src={gnosisLogo} alt="Gnosis" boxSize="30px" rounded="full" />
    </Link>
    {/* <Link target="_blank" href={`https://explorer.goerli.linea.build/address/${ZBAY_DEPLOMENTS[lineaTestnet.id]}`}>
      <Image src={lineaLogo} alt="Linea" boxSize="30px" rounded="full" />
    </Link> */}
    <Link target="_blank" href="https://github.com/wannabehero/ethglobal-waterloo">
      <Image src={github} alt="Github" boxSize="30px" />
    </Link>
  </HStack>
);

export default Footer;

import { HStack, Image, Link } from '@chakra-ui/react';

import github from '../assets/github.png';
import polygon from '../assets/polygon.svg';
import { ZBAY_DEPLOMENTS } from '../web3/consts';

const Footer = () => (
  <HStack py="16px" spacing="12px" justifyContent="center">
    <Link target="_blank" href={`https://polygonscan.com/address/${ZBAY_DEPLOMENTS[80001]}`}>
      <Image src={polygon} alt="Polygon" boxSize="30px" />
    </Link>
    <Link target="_blank" href="https://github.com/wannabehero/ethglobal-waterloo">
      <Image src={github} alt="Github" boxSize="30px" />
    </Link>
  </HStack>
);

export default Footer;

import { Address } from 'viem';
import useXMTPClient from '../hooks/useXMTPClient';
import { Button, HStack, Input, InputGroup, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Conversation, DecodedMessage } from '@xmtp/xmtp-js';
import { Text } from '@chakra-ui/react';

interface ChatModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  title: string;

  companion: Address;
  counterparty: string;

  onClose: () => void;
}

const ChatModal = ({ isOpen, title, counterparty, companion, onClose }: ChatModalProps) => {
  const xmtpClient = useXMTPClient();
  const [conversation, setConversation] = useState<Conversation>();
  const [messages, setMessages] = useState<DecodedMessage[]>([]);
  const [text, setText] = useState('');

  const onSend = async () => {
    conversation?.send(text);
    setText('');
  };

  useEffect(() => {
    if (!xmtpClient) {
      return;
    }

    xmtpClient.conversations.newConversation(companion)
      .then((conversation) => {
        setConversation(conversation);
        conversation.messages().then(setMessages);
      });

  }, [xmtpClient, companion]);

  useEffect(() => {
    if (!conversation) {
      return;
    }

    // Function to stream new messages in the conversation
    const streamMessages = async () => {
      const newStream = await conversation.streamMessages();
      for await (const msg of newStream) {
        const exists = messages.find((m) => m.id === msg.id);
        if (!exists) {
          setMessages((prevMessages) => [...prevMessages, msg]);
        }
      }
    };
    streamMessages();
  }, [conversation, messages]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={2} align="stretch">
            {
              messages.filter(
                (v, i, a) => a.findIndex((t) => t.id === v.id) === i
              ).map((msg) => (
                <HStack key={`chatmsg-${msg.id}`}>
                  <Text as="b">
                    {msg.senderAddress.toLowerCase() === companion.toLocaleLowerCase() ? counterparty : 'You'}
                  </Text>
                  <Text>{msg.content}</Text>
                </HStack>
              ))
            }
          </VStack>
        </ModalBody>

        <ModalFooter>
          <InputGroup>
            <Input
              type="text"
              pr="4.5rem"
              placeholder="Hello..."
              value={text}
              onKeyDown={(e) => e.key === 'Enter' && onSend()}
              onChange={(e) => setText(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" colorScheme="blue" onClick={onSend}>
                Send
              </Button>
            </InputRightElement>
          </InputGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ChatModal;

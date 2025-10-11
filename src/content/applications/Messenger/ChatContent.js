import { Box, Avatar, Typography, Card, styled, Divider } from '@mui/material';
import { useChat } from 'src/contexts/ChatContext';
import {
  formatDistance,
  format,
  subDays,
  subHours,
  subMinutes,
  isToday,
  isYesterday,
  isSameDay
} from 'date-fns';
import ScheduleTwoToneIcon from '@mui/icons-material/ScheduleTwoTone';

const DividerWrapper = styled(Divider)(
  ({ theme }) => `
      .MuiDivider-wrapper {
        border-radius: ${theme.general.borderRadiusSm};
        text-transform: none;
        background: ${theme.palette.background.default};
        font-size: ${theme.typography.pxToRem(13)};
        color: ${theme.colors.alpha.black[50]};
      }
`
);

const CardWrapperPrimary = styled(Card)(
  ({ theme }) => `
      background: ${theme.colors.primary.main};
      color: ${theme.palette.primary.contrastText};
      padding: ${theme.spacing(2)};
      border-radius: ${theme.general.borderRadiusXl};
      border-top-right-radius: ${theme.general.borderRadius};
      max-width: 380px;
      display: inline-flex;
`
);

const CardWrapperSecondary = styled(Card)(
  ({ theme }) => `
      background: ${theme.colors.alpha.black[10]};
      color: ${theme.colors.alpha.black[100]};
      padding: ${theme.spacing(2)};
      border-radius: ${theme.general.borderRadiusXl};
      border-top-left-radius: ${theme.general.borderRadius};
      max-width: 380px;
      display: inline-flex;
`
);

function ChatContent() {
  const { messages, currentUser, getActiveConversation } = useChat();
  const activeConversation = getActiveConversation();

  if (!activeConversation) {
    return (
      <Box p={3} display="flex" alignItems="center" justifyContent="center" height="100%">
        <Typography variant="h6" color="textSecondary">
          Select a conversation to start chatting
        </Typography>
      </Box>
    );
  }

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp);
      let dateKey;
      
      if (isToday(date)) {
        dateKey = 'Today';
      } else if (isYesterday(date)) {
        dateKey = 'Yesterday';
      } else {
        dateKey = format(date, 'MMMM dd yyyy');
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  const renderMessage = (message, isLast = false) => {
    const isMyMessage = message.sender === 'me';
    
    return (
      <Box
        key={message.id}
        display="flex"
        alignItems="flex-start"
        justifyContent={isMyMessage ? "flex-end" : "flex-start"}
        py={1.5}
      >
        {!isMyMessage && (
          <Avatar
            variant="rounded"
            sx={{
              width: 50,
              height: 50
            }}
            alt={message.name}
            src={message.avatar}
          />
        )}
        
        <Box
          display="flex"
          alignItems={isMyMessage ? "flex-end" : "flex-start"}
          flexDirection="column"
          justifyContent={isMyMessage ? "flex-end" : "flex-start"}
          ml={isMyMessage ? 0 : 2}
          mr={isMyMessage ? 2 : 0}
        >
          {isMyMessage ? (
            <CardWrapperPrimary>
              {message.text}
            </CardWrapperPrimary>
          ) : (
            <CardWrapperSecondary>
              {message.text}
            </CardWrapperSecondary>
          )}
          
          {isLast && (
            <Typography
              variant="subtitle1"
              sx={{
                pt: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ScheduleTwoToneIcon
                sx={{
                  mr: 0.5
                }}
                fontSize="small"
              />
              {formatDistance(new Date(message.timestamp), new Date(), {
                addSuffix: true
              })}
            </Typography>
          )}
        </Box>

        {isMyMessage && (
          <Avatar
            variant="rounded"
            sx={{
              width: 50,
              height: 50
            }}
            alt={currentUser.name}
            src={currentUser.avatar}
          />
        )}
      </Box>
    );
  };

  return (
    <Box p={3}>
      {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
        <Box key={dateKey}>
          <DividerWrapper>
            {dateKey}
          </DividerWrapper>
          
          {dateMessages.map((message, index) => {
            const isLastInGroup = index === dateMessages.length - 1;
            const nextMessage = dateMessages[index + 1];
            const isLastFromSender = !nextMessage || nextMessage.sender !== message.sender;
            
            return renderMessage(message, isLastFromSender);
          })}
        </Box>
      ))}
      
      {messages.length === 0 && (
        <Box display="flex" alignItems="center" justifyContent="center" height="200px">
          <Typography variant="body1" color="textSecondary">
            No messages yet. Start the conversation!
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default ChatContent;
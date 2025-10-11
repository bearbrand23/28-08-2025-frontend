/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable jsx-a11y/label-has-for */
import { useState } from 'react';
import {
  Avatar,
  Tooltip,
  IconButton,
  Box,
  Button,
  styled,
  InputBase,
  useTheme
} from '@mui/material';
import AttachFileTwoToneIcon from '@mui/icons-material/AttachFileTwoTone';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';
import { useChat } from 'src/contexts/ChatContext';

const MessageInputWrapper = styled(InputBase)(
  ({ theme }) => `
    font-size: ${theme.typography.pxToRem(18)};
    padding: ${theme.spacing(1)};
    width: 100%;
`
);

const Input = styled('input')({
  display: 'none'
});

function BottomBarContent() {
  const theme = useTheme();
  const { sendMessage, currentUser } = useChat();
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // For now, just send a message about the file
      sendMessage(`📎 Shared file: ${file.name}`);
      event.target.value = ''; // Reset file input
    }
  };

  return (
    <Box
      sx={{
        background: theme.colors.alpha.white[50],
        display: 'flex',
        alignItems: 'center',
        p: 2
      }}
    >
      <Box flexGrow={1} display="flex" alignItems="center">
        <Avatar
          sx={{ display: { xs: 'none', sm: 'flex' }, mr: 1 }}
          alt={currentUser.name}
          src={currentUser.avatar}
        />
        <MessageInputWrapper
          autoFocus
          placeholder="Write your message here..."
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
        />
      </Box>
      <Box>
        <Tooltip arrow placement="top" title="Choose an emoji">
          <IconButton
            sx={{ fontSize: theme.typography.pxToRem(16) }}
            color="primary"
            onClick={() => setMessage(prev => prev + '😀')}
          >
            😀
          </IconButton>
        </Tooltip>
        <Input 
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
          id="messenger-upload-file" 
          type="file"
          onChange={handleFileUpload}
        />
        <Tooltip arrow placement="top" title="Attach a file">
          <label htmlFor="messenger-upload-file">
            <IconButton sx={{ mx: 1 }} color="primary" component="span">
              <AttachFileTwoToneIcon fontSize="small" />
            </IconButton>
          </label>
        </Tooltip>
        <Button 
          startIcon={<SendTwoToneIcon />} 
          variant="contained"
          onClick={handleSendMessage}
          disabled={!message.trim()}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default BottomBarContent;

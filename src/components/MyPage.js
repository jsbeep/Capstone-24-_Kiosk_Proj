import * as React from 'react';
// import { useState } from 'react';
// import { dummy } from '../test/example.js';
import './Login.css';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

// import IconButton from '@mui/material/IconButton';
// import InputLabel from '@mui/material/InputLabel';
// import InputAdornment from '@mui/material/InputAdornment';
// import FormControl from '@mui/material/FormControl';
// import Visibility from '@mui/icons-material/Visibility';
// import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { 
  // TextField, Grid2, Link,
  Button, Box } from '@mui/material';


function MyPage({
  // user, 
  logoutfunc, setMyPageOpen, myPageOpen}) {
  
  // const [userId, setUserID] = useState('');
  // const [password, setPassword] = useState('');
  // const [error, setError] = useState('');
  // const [showPassword, setShowPassword] = useState(false);
  const winsize = window.innerWidth + window.innerHeight;

  // const handleSubmit = (event) => {
  //   event.preventDefault();

  //   if (!userId || !password) {
  //     setError('모든 필드를 채워주세요.');
  //     return;
  //   }

  //   if (userId in dummy.account && password === dummy.account[userId].pwd) {  // 비밀번호 인증
  //     setError('');
  //     alert('로그인 성공!');
  //     logoutfunc(userId)
  //     setMyPageOpen(false);
  //   } else {
  //     setError('이메일 또는 PIN 번호가 잘못되었습니다.');
  //   }
  // };

  // const handleClickShowPassword = () => setShowPassword((show) => !show);

  // const handleMouseDownPassword = (event) => {
  //   event.preventDefault();
  // };

  // const handleMouseUpPassword = (event) => {
  //   event.preventDefault();
  // };

  return (
    <React.Fragment>
      <Dialog
        fullWidth
        maxWidth={'sm'}
        open={myPageOpen}
        onClose={()=>setMyPageOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#ffffff', // 배경색
            color: '#092979', // 텍스트 색상
            borderRadius: 3, // 둥근 모서리
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)', 
            height: '80vh',
          },
        }}
      >
        <Button
          disableElevation
          variant='contained'
          size={winsize ? 'large' : 'medium'}
          onClick={()=>{setMyPageOpen(false); logoutfunc()}}
          sx={{ mt: 3, mb: 3,
            position: 'absolute',
            color: "#acbeea",
            bgcolor: '#092979',
            top: '20px',
            right: '25px',
            border: '1px solid black',
            borderColor: '#acbeea',
            padding: '2px',
            paddingLeft: '10px',
            paddingRight: '10px',
            boxShadow: '0',
            margin: '0'
            }}
        >
          Log Out
        </Button>
        <DialogTitle>My Page</DialogTitle>
        <DialogContent sx={{
          display: 'flex', 
          flexDirection: 'column', 
          // marginTop:'40px',
        }}>
          <Box sx={{
            width:'100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'end',
            m:0,
            p:0
          }}>
            <SentimentDissatisfiedIcon sx={{
              fontSize: 600,
              color:'#ececec'
            }}/>

          </Box>

        </DialogContent>
        <DialogActions>
          <Button sx={{
            position:'absolute',
            color: "#acbeea",
            bgcolor: '#092979',
            bottom: '25px',
            right: '25px',
            border: '1px solid black',
            borderColor: '#acbeea',
            padding: '0'
          }}
          size={winsize ? 'large' : 'medium'}
          onClick={()=>setMyPageOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default MyPage;

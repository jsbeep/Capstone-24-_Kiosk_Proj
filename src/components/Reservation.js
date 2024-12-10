import * as React from 'react';
import { useState, useEffect } from 'react';

import { db } from '../test/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

import AdminPage from './AdminPage';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center', // 중앙 정렬
  maxWidth: '400px',
  marginBottom: '30px',
  [`& .MuiToggleButton-root`]: {
    width: '105px',
    padding: theme.spacing(1.3, 1),
    backgroundColor: 'white',
    color: 'black',
    "&.Mui-selected, &.Mui-selected:hover": {
      backgroundColor: '#3c59a3', // 눌렀을 때 배경색 변경
      color: 'white',
    },
  },
  '& .MuiToggleButtonGroup-grouped': {
    margin: theme.spacing(0.5),
    border: '1px solid #dddddd',
    borderRadius: theme.shape.borderRadius,
  },
  '& .MuiToggleButtonGroup-middleButton.Mui-disabled':{
    borderLeft: '1px solid #e0e0e0',
    color: '#e0e0e0'
  },
  '& .Mui-disabled':{
    color: '#e0e0e0'
  },
}));
const Android12Switch = styled(Switch)(({ theme }) => ({
  padding: 8,
  '& .MuiSwitch-track': {
    borderRadius: 22 / 2,
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 16,
      height: 16,
    },
    '&::before': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main),
      )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
      left: 12,
    },
    '&::after': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main),
      )}" d="M19,13H5V11H19V13Z" /></svg>')`,
      right: 12,
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: 16,
    height: 16,
    margin: 2,
  },
}));

const docRef_room = doc(db, "test", "room");

const IndexToTime = function (index) {
  const hours = String(Math.floor(index / 2) + 6).padStart(2, '0'); // 06부터 시작
  const minutes = index % 2 === 0 ? '00' : '30'; // 0은 ':00', 1은 ':30'
  const time = `${hours}:${minutes}`;
  return time
}
const TimeToIndex = function (time) {
  const [hours, minutes] = time.split(':').map(Number);  // 시간을 ':' 기준으로 분리하고 숫자로 변환
  const index = (hours - 6) * 2 + (minutes === 30 ? 1 : 0);  // 06:00부터 시작하는 인덱스 계산
  return index < 0 ? 0 : index;
};

function ReservationPage({ user, setReserveOpen, reserveOpen, currentTime }) {
  // {
  //   month: 12,
  //   date: 9,
  //   roomText: A,
  //   roomName: 알파,
  //   time: 06:00,
  //   index: 0,
  //   day: day1 
  // } [currentTime.roomText]['Reserve'][currentTime]
  const [selectedTime, setSelectedTime] = useState(null);
  const [timeTable, setTimetable] = useState(null);
  const [openDial, setOpenDial] = useState(false);
  const [isAdmin, setAdmin] = useState(false);

  const handleChange = (event) => {
    setAdmin(event.target.checked);
  };

  const handleTimeChange = (event, newTime) => {
    setSelectedTime(newTime);
  };

  useEffect(() => {
    const unsubscribe_Reserve = onSnapshot(docRef_room, (doc) => {
      setTimetable(doc.data());
    });
    // 컴포넌트 언마운트 시 리스너 정리
    return () => unsubscribe_Reserve();
  }, []);
  const timeTable_room = timeTable ? timeTable[currentTime.roomText]['Reserve'][currentTime.day] : []
  
  async function setReservation(){
    try {
      await updateDoc(docRef_room, {
        [`${currentTime.roomText}.Reserve.${currentTime.day}`]: 
          timeTable_room.map((item, index) =>
            index >= currentTime.index && index < currentTime.index + selectedTime ? 1 : item
          ),
      });
      console.log(`유저 '${user.id}' 예약정보 인덱스 추가- ${currentTime.day}:${currentTime.index}~${currentTime.index+selectedTime} `);
    } catch (error) {
      console.error("문서 수정 오류: ", error);
    }
    setOpenDial(false); 
    setReserveOpen(false);
    setSelectedTime(null);
  }

  const reserveText = `${currentTime.month}월 ${currentTime.date}일 ${currentTime.roomName}룸 ${currentTime.time} ~ ${IndexToTime(TimeToIndex(currentTime.time) + selectedTime)}`

  const ReservationDialog = () => (
    <>
      <DialogContent sx={dialogContentStyles}>
        <DialogContentText variant="h6" sx={{ color: '#3c59a3' }}>
          {reserveText}
        </DialogContentText>
        <Paper sx={paperStyles} elevation={3}>
          <StyledToggleButtonGroup
            value={selectedTime}
            exclusive
            onChange={handleTimeChange}
            aria-label="time duration"
          >
            {['30분', '1시간', '1시간 30분', '2시간', '2시간 30분', '3시간'].map((item, index) => (
              <ToggleButton
                disabled={isDisabled(index)}
                key={index}
                value={index + 1}
                aria-label={index + 1}
              >
                {item}
              </ToggleButton>
            ))}
            <Button
              disabled={!selectedTime}
              variant="contained"
              disableElevation
              sx={buttonStyles}
              onClick={() => setOpenDial(true)}
            >
              예약하기
            </Button>
          </StyledToggleButtonGroup>
        </Paper>
      </DialogContent>
    </>
  );

  const dialogContentStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '10px',
    '.MuiInputBase-root::before': { display: 'none' },
    '.MuiInputBase-root::after': { display: 'none' },
    '.MuiInputBase-root': { borderRadius: '15px' },
    '& .MuiInputBase-input': { color: 'white' },
    '.MuiFilledInput-root': { bgcolor: '#3c59a3' },
    '& .MuiInputLabel-root': { color: '#7792d4' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#acbeea' },
    '& .MuiInputLabel-root.Mui-error': { color: '#dc3545' },
    '&.Mui-focused': {
      '& .MuiFilledInput-input': { color: '#ffffff' },
    },
  };
  
  const paperStyles = {
    bgcolor: 'transparent',
    boxShadow: '0',
    padding: 2,
    pb: 1,
  };
  
  const buttonStyles = {
    width: '218px',
    pt: 1.3,
    pb: 1.3,
    bgcolor: '#092979',
    color: "white",
    mt: 2,
  };

  const isDisabled = (index) => 
    Boolean(timeTable_room.slice(currentTime.index, currentTime.index + index + 1)
    .reduce((acc, cur) => acc + cur, 0)) || currentTime.index + index > 35;

  const admin = (user && user.name === '관리자');

  return (
    <React.Fragment>
      <Dialog
        fullWidth
        maxWidth={'sm'}
        open={reserveOpen}
        onClose={() => {setReserveOpen(false);
          setSelectedTime(null);}}
        PaperProps={{
          sx: {
            bgcolor: '#fffff', // 배경색
            color: '#092979', // 텍스트 색상
            borderRadius: 3, // 둥근 모서리
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
            alignItems: 'center',
          },
        }}
      >
        <DialogTitle>예약</DialogTitle>
      {admin&&<FormControlLabel
        sx={{
          position: 'absolute',
          right: 0,
          top: 12,
          '& .MuiTypography-root': { fontSize: 12, position: "absolute", top: 30 }
        }}
        labelPlacement="bottom"
        checked={isAdmin}
        onChange={handleChange}
        control={<Android12Switch defaultChecked />}
        label="Admin"
      />}
        {isAdmin ? <AdminPage setReserveOpen={setReserveOpen} reserveOpen={reserveOpen} currentTime={currentTime}/> : <ReservationDialog />}

        <DialogActions>
          <Button sx={{
            color: "#acbeea",
            position: 'absolute',
            bottom: '25px',
            right: '25px',
            border: '1px solid black',
            borderColor: '#acbeea',
            padding: '0'
          }}
            onClick={() => {setReserveOpen(false);
              setSelectedTime(1);}}
          >Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDial} 
        onClose={() => {
          setOpenDial(false);
          setSelectedTime(1);
        }} 
        aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">예약 확인</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          {reserveText}
            <br />예약하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={setReservation} autoFocus>
            네
          </Button>
        </DialogActions>
      </Dialog>

    </React.Fragment>
  );
}

export default ReservationPage;

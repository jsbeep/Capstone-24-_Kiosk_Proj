import * as React from 'react';
import { useState, useEffect } from 'react';

import { db } from '../test/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

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
import { Box } from '@mui/material';

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

function AdminPage({ user, setReserveOpen, reserveOpen, currentTime }) {
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
  const [editType, setEditType] = useState(null); // cancel: true | disable: false
  const [openDial, setOpenDial] = useState(false);

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

  async function setEdit() {
    const value = editType ? 0 : 2; // 예약가능: 0, 예약 중지: 2
    const cond1 = (index) => index >= currentTime.index && index < currentTime.index + selectedTime

    try {
      const updateRoomData = async (day, updatedValues) => {
        await updateDoc(docRef_room, {
          [`${currentTime.roomText}.Reserve.${day}`]: updatedValues,
        });
      };
    
      const getUpdatedValues = () =>
        timeTable_room.map((item, index) =>
          cond1(index) ? value : item
        );
    
      const updateMultipleDays = async (days) => {
        const updatedValues = timeTable_room.map(() => value);
        await Promise.all(
          days.map((day) => updateRoomData(day, updatedValues))
        );
      };
    
      if (selectedTime < 7) {
        await updateRoomData(currentTime.day, getUpdatedValues());
      } else if (selectedTime === 7) {
        await updateMultipleDays([currentTime.day]);
      } else await updateMultipleDays(['day1', 'day2', 'day3']);

    } catch (error) {
      console.error("문서 수정 오류: ", error);
    }
    setOpenDial(false);
    setReserveOpen(false);
    setSelectedTime(1);
  }

  const reserveText = selectedTime < 7 ? `${currentTime.month}월 ${currentTime.date}일 ${currentTime.roomName}룸 ${currentTime.time} ~ ${IndexToTime(TimeToIndex(currentTime.time) + selectedTime)}`
            : `${currentTime.month}월 ${currentTime.date}일 ${currentTime.roomName}룸 - ${selectedTime===7 ? '전체 시간' : '전체 날짜'}`;

  const editMessage = editType ? ' 활성화' : ' 비활성화';

  return (
    <React.Fragment>
      <DialogContent sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '10px',
        '.MuiInputBase-root::before': {
          display: 'none'
        },
        '.MuiInputBase-root::after': {
          display: 'none'
        },
        '.MuiInputBase-root': {
          borderRadius: '15px',
        },
        '& .MuiInputBase-input': {
          color: 'white', // 내부 글자 색을 흰색으로 설정
        },
        '.MuiFilledInput-root': {
          bgcolor: '#3c59a3', // 배경색
        },
        '& .MuiInputLabel-root': {
          // 기본상태 라벨 색상
          color: '#7792d4',
        },
        '& .MuiInputLabel-root.Mui-focused': {
          // 포커스 상태에서 라벨 색상
          color: '#acbeea',
        },
        '& .MuiInputLabel-root.Mui-error': {
          // 오류 상태에서 라벨 색상
          color: '#dc3545',
        },
        '&.Mui-focused': {
          '& .MuiFilledInput-input': {
            color: '#ffffff', // 포커스 시 텍스트 색상 변경
          },
        },
      }}>
        <DialogContentText variant='h6' sx={{ color: '#3c59a3' }}>
        {reserveText}
        </DialogContentText>

        <Paper sx={{
          bgcolor: 'transparent',
          boxShadow: '0',
          padding: 2,
          pb: 1
        }}
          elevation={3}>
          <StyledToggleButtonGroup
            value={selectedTime}
            exclusive
            onChange={handleTimeChange}
            aria-label="time duration">
            {['30분', '1시간', '1시간 30분', '2시간', '2시간 30분', '3시간', '전체 시간', '전체 날짜'].map((item, index) => (
              <ToggleButton
                key={index} value={index + 1} aria-label={index + 1}>
                {item}
              </ToggleButton>
            ))}

            <Box sx={{display: 'flex'}}>
            <Button
              disabled={!selectedTime}
              disableElevation
              variant='contained'
              sx={{
                width: window.innerHeight > window.innerWidth ? '105px' : '162px',
                pt: 1.3,
                pb: 1.3,
                pl: 0,
                pr: 0,
                bgcolor: '#092979',
                color: "white",
                mr: 0.5,
                mt: 2,
              }}
              onClick={() => {setOpenDial(true);setEditType(true)}}
              >예약 활성화</Button>
            <Button
              disableElevation
              disabled={!selectedTime}
              variant='contained'
              sx={{
                width: window.innerHeight > window.innerWidth ? '105px' : '162px',
                pt: 1.3,
                pb: 1.3,
                bgcolor: '#092979',
                color: "white",
                ml: 0.5,
                mt: 2,
              }}
              onClick={() => {setOpenDial(true);setEditType(false)}}
              >예약 중지</Button>
            </Box>
          </StyledToggleButtonGroup>
        </Paper>
      </DialogContent>

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
          onClick={() => {
            setReserveOpen(false);
            setSelectedTime(1);
          }}
        >Close</Button>
      </DialogActions>

      <Dialog open={openDial}
        onClose={() => {
          setOpenDial(false);
          setSelectedTime(1);
        }}
        aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">예약 {editMessage}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {reserveText}
            <br />예약을 {editMessage}하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={setEdit} autoFocus>
            네
          </Button>
        </DialogActions>
      </Dialog>

    </React.Fragment>
  );
}

export default AdminPage;

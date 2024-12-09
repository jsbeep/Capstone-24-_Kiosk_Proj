import * as React from 'react';
import { useState, useEffect } from 'react';
// import { dummy } from '../test/example.js';
// import './Login.css';
import { db } from '../test/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';

import Grid from '@mui/material/Grid2';
import { Box, Typography, Button, ButtonGroup } from '@mui/material';

const docRef = doc(db, "test", "room");

const roomName = {'A': '알파', 'B': '베타', 'C': '감마'};
const roomState = {0: '예약 가능', 1: '예약중', 2: '예약 불가'};
const days = ['day1', 'day2', 'day3'];
const day7 = ['일', '월', '화', '수', '목', '금', '토'];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function TablePageColmn({user, setTablePageOpen, tablePageOpen, openReservation }) {
  const [selectedDay, setSelectedDay] = useState('day1'); // 초기 선택된 날짜는 'day1'
  const [timetable, setTimetable] = useState(''); // 초기 선택된 날짜는 'day1'

  const today = new Date();
  const upcomingDays = {};
  for (let i = 0; i <= 2; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i); // i일 후 날짜 계산
      upcomingDays[`day${i+1}`] = [day7[futureDate.getDay()], futureDate.getDate()]; // {day1: [9, 월], ..}
  }

  async function getTimetable() {
    const docSnap = await getDoc(docRef);

    setTimetable(docSnap.data());
  };
  
  useEffect(() => { 
    getTimetable();

    const unsubscribe_TimeTable = onSnapshot(docRef, (doc) => {
      setTimetable(doc.data());
    });
    // 컴포넌트 언마운트 시 리스너 정리
    return () => unsubscribe_TimeTable();
  },[]);

  const handleDayChange = (day) => {
    setSelectedDay(day);
  };
  const handleClose = () => {
    setTablePageOpen(false);
  };
  
  const times = Array.from({ length: 36 }, (_, i) => {
    const hour = String(Math.floor(6 + i / 2)).padStart(2, '0');
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour}:${minute}`;
  });

  const IndexToTime = function (index) {
    const hours = String(Math.floor(index / 2) + 6).padStart(2, '0'); // 06부터 시작
    const minutes = index % 2 === 0 ? '00' : '30'; // 0은 ':00', 1은 ':30'
    const time = `${hours}:${minutes}`;
    return time
  }

  return (
    <React.Fragment>
      <Dialog
        fullScreen
        open={tablePageOpen}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position:'relative' ,bgcolor: '#092979', boxShadow: 0, pb: 2 }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            > 
              <CloseIcon /> 
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div"> 
              예약하기
            </Typography>
          </Toolbar>
          <Box sx={{flexGrow: 1, padding: 2, display: 'flex', 
          flexDirection:'row', alignItems: 'start'}}>
            <ButtonGroup variant="contained">

            {days.map(day => (
              <Button
              key={day}
              sx={{
                bgcolor: selectedDay === day ? 'white' : '#092979',
                color: selectedDay === day ? '#092979' : 'white',
                borderRadius: 2
              }}
              size='large'
              onClick={() => handleDayChange(day)}>
                  {upcomingDays[day][0]} {/* day1 => 1, day2 => 2 형식으로 표시 */}
              </Button>
            ))}
            </ButtonGroup>
          </Box>
        </AppBar>
        
        <Box sx={{ flexGrow: 1, display: 'flex', bgcolor: '#f6f7f8'}}>
          <Grid direction="row" container spacing={0.5} justifyContent="center" alignItems="center" sx={{width: '100%'}}>
            <Grid sx={{width: '60px'}}>
              <Typography variant="h6" align="center" sx={{p:1,bgcolor: 'white', borderBottom: '3px solid #092979'}}>
                시간
              </Typography>
            </Grid>
            {Object.entries(timetable).filter(([key]) => ['A', 'B', 'C'].includes(key)).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([key, days]) => (
              <Grid sx={{width: '25%'}} key={key}>
                <Typography variant="h6" align="center" sx={{p:1, bgcolor: 'white', borderBottom: '3px solid #092979',}}>
                  {roomName[key]}
                </Typography>
              </Grid>))}
          </Grid>
        </Box>

        <Box sx={{ flexGrow: 1, paddingTop: '5px', paddingBottom: '60px', 
           bgcolor: '#f6f7f8', maxHeight: '100%', overflowY: 'auto'}}>
          <Grid direction='row' container spacing={0.5} justifyContent="center" alignItems="center" sx={{width: '100%'}}>
            {/* 시간 열 */}
            <Grid direction='row' sx={{width: '60px'}}>
              {times.map((time) => (
                <Box key={time} sx={{ paddingTop: 1.7, paddingBottom: 1.7, borderBottom: '1px solid #ddd' }}>
                  <Typography align="center">{time}</Typography>
                </Box>
              ))}
            </Grid>
            {/* 그룹별 상태 열 */}
            {Object.entries(timetable).filter(([key]) => ['A', 'B', 'C'].includes(key)).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([key, days]) => (
              <Grid direction='row' sx={{width: '25%'}} key={key}>
                {days.Reserve[selectedDay].map((status, index) => (
                  <Box
                    key={index}
                    onClick={status ? null : () => openReservation({
                      month: today.getMonth()+1,
                      date: today.getDate(),
                      roomText: key,
                      roomName: roomName[key],
                      time: IndexToTime(index),
                      index: index,
                      day: selectedDay
                    })}
                    sx={{
                      // width: '15vw',
                      padding: 1.7,
                      borderBottom: '1px solid #ddd',
                      backgroundColor:
                        status === 0
                          ? 'white'
                          : '#f0f9ff',
                      color:
                        status === 0
                          ? '#3e5ba5'
                          : '#c5ccd9'
                    }}
                  >
                    <Typography align="center">{roomState[status]}</Typography>
                  </Box>
                ))}
              </Grid>
            ))}
          </Grid>
        </Box>
        
      </Dialog>
    </React.Fragment>
  );
}

export default TablePageColmn;

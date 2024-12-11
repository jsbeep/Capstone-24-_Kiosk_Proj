import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
// import { dummy } from '../test/example.js';
// import './Login.css';
import { db } from '../test/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';

import {  Box, Typography, Button, ButtonGroup } from '@mui/material';

const docRef = doc(db, "test", "room");

const roomName = { 'A': '알파', 'B': '베타', 'C': '감마' };
const roomState = { 0: '예약 가능', 1: '예약중', 2: '예약 불가' };
const days = ['day1', 'day2', 'day3'];
const day7 = ['일', '월', '화', '수', '목', '금', '토'];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function TablePageRow({ user, setTablePageOpen, tablePageOpen, openReservation, setLoginAlert }) {
  const [selectedDay, setSelectedDay] = useState('day1'); // 초기 선택된 날짜는 'day1'
  const [timetable, setTimetable] = useState(''); // 초기 선택된 날짜는 'day1'
  
  const targetRef = useRef(null);
  const handleScroll = () => {
    setTimeout(() => {
      if (targetRef.current) {
        targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.error("Target element is not available.");
      }
    }, 100);
  };
  function getCurrentIndex() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');  // 시간 (두 자리로 맞추기)
    const minutes = now.getMinutes().toString().padStart(2, '0');  // 분 (두 자리로 맞추기)
    const index = (hours - 6) * 2 + (minutes === 30 ? 1 : 0);  // 06:00부터 시작하는 인덱스 계산
    return index<0 ? 0 : index;
  }

  const today = new Date();
  const upcomingDays = {};
  for (let i = 0; i <= 2; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i); // i일 후 날짜 계산
      upcomingDays[`day${i+1}`] = [day7[futureDate.getDay()], futureDate.getDate()]; // {day1: [9, 월], ..}
  }

  useEffect(() => {
    handleScroll();

    const unsubscribe_TimeTable = onSnapshot(docRef, (doc) => {
      setTimetable(doc.data());
    });
    // 컴포넌트 언마운트 시 리스너 정리
    return () => unsubscribe_TimeTable();
  }, [tablePageOpen]);

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

  const admin = (user && user.name === '관리자');

  return (
    <React.Fragment>
      <Dialog
        fullScreen
        open={tablePageOpen}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative', bgcolor: '#092979', height: '25%' }}>
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
                  onClick={() => handleDayChange(day)}              >
                  {upcomingDays[day][0]} {/* day1 => 1, day2 => 2 형식으로 표시 */}
                </Button>
              ))}
            </ButtonGroup>
          </Toolbar>
          <Box sx={{
            flexGrow: 1, padding: 1, display: 'flex',
            flexDirection: 'row', alignItems: 'start'
          }}>
          </Box>
        </AppBar>

        <Box  style={{
          padding: 5,
          display: 'flex',
          overflowX: 'auto',
          width: 'auto',
          height: '100%',
          flexDirection: 'row',
          backgroundColor: '#f6f7f8'
        }}>
          <Box  style={{
            display: 'flex',
            width: 'auto',
            height: '100%',
            flexDirection: 'column',
            backgroundColor: '#f6f7f8'
          }}>
            <Box  style={{
              display: 'flex',
              height: '60px',
              width: 'auto',
            }}>
              <Box
                sx={{
                  backgroundColor: 'white',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexShrink: 0,
                  width: '80px',
                  display: 'flex',
                  marginRight: 0.5,
                  marginBottom: 0.2,
                  padding: 1,
                  borderBottom: '1px solid #ddd',
                  borderRight: '3px solid #092979',
                }}>
                <Typography variant='h6' align="center">시간</Typography>
              </Box>
            </Box> 
            {/* 최종 */}

            <Box  style={{
              width: 'auto',
              flexDirection: 'column',
            }}>

              {Object.entries(timetable)
                .filter(([key]) => ['A', 'B', 'C'].includes(key))
                .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                .map(([key, days]) => (
                  <Box
                    key={key}
                    sx={{
                      display: 'flex',
                      height: 'auto',
                      width: 'auto',
                    }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 0.5,
                        marginBottom: 0.2,
                        padding: 1,
                        borderBottom: '1px solid #ddd',
                        borderRight: '3px solid #092979',
                        width: '80px',
                        height: '10vh',
                        backgroundColor: 'white'
                      }}>
                      <Typography variant='h6' align="center">{roomName[key]}</Typography>
                    </Box>
                  </Box>
                ))}
            </Box>

          </Box>

          <Box  style={{
            display: 'flex',
            overflowX: 'auto',
            width: 'auto',
            height: '100%',
            flexDirection: 'column',
            backgroundColor: '#f6f7f8'
          }}>
            <Box  style={{
              display: 'flex',
              height: '60px',
              width: 'auto',
            }}>
              {times.map((time) => (
                <Box
                  key={time}
                  sx={{
                    backgroundColor: '#f6f7f8',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexShrink: 0,
                    width: '80px',
                    display: 'flex',
                    marginRight: 0.5,
                    marginBottom: 0.2,
                    padding: 1,
                    borderBottom: '1px solid #ddd',
                  }}>
                  <Typography align="center">{time}</Typography>
                </Box>
              ))}
            </Box>

            <Box  style={{
              // display: 'flex',
              // height: '100%',
              width: 'auto',
              // overflowX: 'auto',
              flexDirection: 'column',
            }}>

              {Object.entries(timetable)
                .filter(([key]) => ['A', 'B', 'C'].includes(key))
                .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                .map(([key, days]) => (
                  <Box
                    key={key}
                    sx={{
                      display: 'flex',
                      height: 'auto',
                      width: 'auto',
                    }}>
                    {days.Reserve[selectedDay].map((status, index) => (
                      <Box
                        ref={index === getCurrentIndex()+5 ? targetRef : null}
                        key={index}
                        onClick={(Boolean(status)&&!admin) ? null : (user ? () => openReservation({
                          month: today.getMonth()+1,
                          date: today.getDate(),
                          roomText: key,
                          roomName: roomName[key],
                          time: IndexToTime(index),
                          index: index,
                          day: selectedDay,
                          userName: user.name
                        }) : () => setLoginAlert(true))}
                        sx={{
                          flexShrink: 0,
                          cursor: "pointer",
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 0.5,
                          marginBottom: 0.2,
                          padding: 1,
                          borderBottom: '1px solid #ddd',
                          backgroundColor: status === 0 ? 'white' : '#f0f9ff',
                          color: status === 0 ? '#3e5ba5' : '#c5ccd9',
                          width: '80px',
                          height: '10vh',
                        }}>
                        <Typography align="center">{roomState[status]}</Typography>
                      </Box>
                    ))}
                  </Box>
                ))}
            </Box>
          </Box>
        </Box>
      </Dialog>
    </React.Fragment>
  );
}

export default TablePageRow;

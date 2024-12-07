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

import {  Box, Typography, Button, ButtonGroup } from '@mui/material';

const docRef = doc(db, "test", "room");

const roomName = { 'A': '알파', 'B': '베타', 'C': '감마' };
const roomState = { 0: '예약 가능', 1: '예약중', 2: '예약 불가' };
const days = ['day1', 'day2', 'day3'];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function TablePage({ user, setTablePageOpen, tablePageOpen, setReserveOpen }) {
  const [selectedDay, setSelectedDay] = useState('day1'); // 초기 선택된 날짜는 'day1'
  const [timetable, setTimetable] = useState(''); // 초기 선택된 날짜는 'day1'

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
  }, []);

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
                  onClick={() => handleDayChange(day)}              >
                  {`Day ${day.charAt(3)}`} {/* day1 => 1, day2 => 2 형식으로 표시 */}
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

        <Box container style={{
          padding: 5,
          display: 'flex',
          overflowX: 'auto',
          width: 'auto',
          height: '100%',
          flexDirection: 'row',
          backgroundColor: '#f6f7f8'
        }}>
          <Box container style={{
            display: 'flex',
            width: 'auto',
            height: '100%',
            flexDirection: 'column',
            backgroundColor: '#f6f7f8'
          }}>
            <Box container style={{
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

            <Box container style={{
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

          <Box container style={{
            display: 'flex',
            overflowX: 'auto',
            width: 'auto',
            height: '100%',
            flexDirection: 'column',
            backgroundColor: '#f6f7f8'
          }}>
            <Box container style={{
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

            <Box container style={{
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
                        key={index}
                        onClick={status ? null : () => setReserveOpen(true)}
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
                          backgroundColor: status === 0 ? 'white' : '#eef2ff',
                          color: status === 0 ? '#3e5ba5' : status === 2 ? '#724c50' : '#888c96',
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

export default TablePage;

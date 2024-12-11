import React from 'react';
import { useState, useEffect, useRef } from 'react';
// import { dummy } from '../test/example.js';
import './QuickButton.css';

import { db } from '../test/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import Button from '@mui/material/Button';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import IconButton from '@mui/material/IconButton';

import Grid from '@mui/material/Grid2';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const displaytext = {"A": "α", "B": "β", "C": "γ"}
const roomName = { 'A': '알파', 'B': '베타', 'C': '감마' };
const docRef_open = doc(db, "test", "open");
const docRef_room = doc(db, "test", "room");

function QuickButton({ user, open, func, text, openReservation, setOpenAlert, checkReserve }) {
  const [dial, setDial] = useState(false);
  const [dial2, setDial2] = useState(false);
  const [lock, setLock] = useState(false);
  const [timeTable, setTimetable] = useState([]);
  const winsize = window.innerWidth + window.innerHeight;

  const targetRef = useRef(null);
  const handleScroll = () => {
    setTimeout(() => {
      if (targetRef.current) {
        targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.error("Target element is not available.");
      }
    }, 100); // 1초 (1000ms) 후 실행
  };

  useEffect(() => { 
    const unsubscribe_room = onSnapshot(docRef_room, (doc) => {
      setTimetable(doc.data()[text]['Reserve']['day1']);
    });
    const unsubscribe_lock = onSnapshot(docRef_open, (doc) => {
      setLock(doc.data()[text]);
      console.log(doc.data());
    });
    // 컴포넌트 언마운트 시 리스너 정리
    return () => {
      unsubscribe_room();
      unsubscribe_lock();
    };
  },[text]);

  const updateDocument = async (field, value) => {
    try {
      await updateDoc(docRef_open, {
        [field]: value,  // 동적으로 필드와 값을 설정
      });
      console.log("문서가 성공적으로 수정되었습니다!");
    } catch (error) {
      console.error("문서 수정 오류: ", error);
    }
  };

  const unlock = () => {  // 문 열기(사용중 전환) + 키 보관함 오픈 요청
    updateDocument(text, !lock);
    updateDocument("request", text)
    setDial(false);
    setDial2(true)
  };
  const request = () => { // 키 보관함 닫기 요청
    updateDocument("request", "");
    setDial2(false);
  };

  const isWideScreen = winsize > 1500;
  const isOpen = open[text];
  const dt = displaytext[text]

  const IndexToTime = function(index) {
    const hours = String(Math.floor(index / 2) + 6).padStart(2, '0'); // 06부터 시작
    const minutes = index % 2 === 0 ? '00' : '30'; // 0은 ':00', 1은 ':30'
    const time = `${hours}:${minutes}`;
    return time
  }

  function getCurrentIndex(cor = false) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');  // 시간 (두 자리로 맞추기)
    const minutes = now.getMinutes().toString().padStart(2, '0');  // 분 (두 자리로 맞추기)
    const index = (hours - 6) * 2 + (minutes === 30 ? 1 : 0);  // 06:00부터 시작하는 인덱스 계산
    return cor ? index : index<0 ? 0 : index;
  }

  const today = new Date();
  const admin = (user && user.name === '관리자');

  return (
    <List className="QB">
      <ListItemButton
        onClick={!isOpen ? () => {func(open, text);handleScroll()} : null}
        disableTouchRipple={isOpen}
        sx={{
          width: '97%',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          '& ul': { padding: 0 },
        }}
      >
        <div onClick={isOpen ? () => func(open, text) : null} className="btn">
          {dt}
        </div>
        {isOpen ? (
          <ExpandLess sx={{ width: '100%' }} onClick={isOpen ? () => func(open, text) : null} />
        ) : (
          <ExpandMore onClick={isOpen ? () => func(open, text) : null} />
        )}
        <div className="heightttt" style={{ height: isOpen ? 0 : '26%' }} />
        <Collapse
          className="collapse"
          sx={{ overflow: 'auto' }}
          in={isOpen}
          timeout={{ enter: 600, exit: 200 }}
          unmountOnExit
        >
          <div className="test">
            <ul>
              <ListItem sx={{width: '300px'}}>
                <Grid container spacing={2} justifyContent="center">
                  {timeTable.map((value, index) => (
                    <Grid key={index}>
                      <Button
                        ref={index === getCurrentIndex() ? targetRef : null}
                        // disabled={Boolean(value)}
                        disableRipple={Boolean(value)}
                        disableElevation={true}
                        onClick={(Boolean(value)&&!admin) ? null : (user ? () => openReservation({
                          month: today.getMonth()+1,
                          date: today.getDate(),
                          roomText: text,
                          roomName: roomName[text],
                          time: IndexToTime(index),
                          index: index,
                          day: 'day1',
                          userName: user.name
                        }) : () => setOpenAlert('login'))}
                        sx={Boolean(value) ? {borderColor: '#cacaca', color: '#cacaca'} : { boxShadow: 0 }}
                        variant={Boolean(value) ? "outlined" : "contained"}
                        size="large"
                      >
                        {IndexToTime(index)}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </ListItem>
            </ul>
          </div>
          <div style={{ height: '80px' }} />
        </Collapse>
      </ListItemButton>
      <div className="icon">
        <IconButton 
        aria-label="Example" onClick={() => {user ? (checkReserve('day1', text, getCurrentIndex(true)) ? setDial(true) : setOpenAlert('reserve') ) : setOpenAlert('login')}}>
          {lock ? (
            <LockOpenOutlinedIcon
              fontSize={isWideScreen ? 'large' : 'medium'}
              sx={{ color: '#9dd52d' }}
            />
          ) : (
            <LockOutlinedIcon
              fontSize={isWideScreen ? 'large' : 'medium'}
              sx={{ color: '#e91e63' }}
            />
          )}
        </IconButton>
      </div>
      <Dialog open={dial} onClose={() => setDial(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{`스터디룸 ${lock ? '대여' : '반납'}`}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {user ? `스터디룸 - ${roomName[text]}룸을 ${lock ? '대여' : '반납'}하시겠습니까?` : "로그인이 필요합니다. 123 123 ㄱㄱ"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {user && <Button onClick={() => setDial(false)}>아니오</Button>}
          <Button onClick={ unlock } autoFocus>
            네
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={dial2} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{"테스트용"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {`키 ${lock ? '반납' : '수령'} 후 확인 버튼을 눌러주세요.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={request} autoFocus>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </List>
  );
}

export default QuickButton;

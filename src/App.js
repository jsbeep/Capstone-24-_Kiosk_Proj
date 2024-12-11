import * as React from 'react';
import { useState, useEffect } from 'react';
import QuickButton from './components/QuickButton';
import MyPage from './components/MyPage';
import Loginform from './components/Login';
import TablePageRow from './components/TablePage_Row.js';
import TablePageColmn from './components/TablePage_Column.js';
import ReservationPage from './components/Reservation.js';

import { auth, db } from './test/firebase.js';
import { doc, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import HelpIcon from '@mui/icons-material/Help';
import './App.css';

import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

const state = { "A": false, "B": false, "C": false };
const docRef = doc(db, "test", "test");
const docRef_user = doc(db, "test", "user");

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(null);
  const [loginAlert, setLoginAlert] = useState(false);
  const [open, setOpen] = useState(state);
  const [dailOpen, setDailOpen] = useState(false);
  const [myPageOpen, setMyPageOpen] = useState(false);
  const [tablePageOpen, setTablePageOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const isWideScreen = windowSize.width + windowSize.height > 1500;
  const [test, setTest] = useState("")

  useEffect(() => {
    const unsubscribe_Test = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setTest(doc.data());
        console.log(test.test);
      }
    });
    const unsubscribe_User = onSnapshot(docRef_user, (doc) => {
      if (doc.exists()) {
        setUsers(doc.data());
      }
    });

    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    // 스크롤 체크 함수
    function checkScrollPosition() {
      const scrollTop = window.scrollY; // 현재 스크롤 위치
      const windowHeight = window.innerHeight; // 화면 높이
      const documentHeight = document.documentElement.scrollHeight; // 문서 전체 높이

      if (!dailOpen && scrollTop + windowHeight >= documentHeight - 300) {
        // 아래로 스크롤 끝에 도달
        window.scrollTo({
          top: (windowHeight < 500) ? 5 : 250,
          behavior: (windowHeight < 500) ? 'auto' : 'smooth',
        });
      } else if (!dailOpen && scrollTop <= 200) {
        // 위로 스크롤
        window.scrollTo({
          top: (windowHeight < 500) ? 5 : 250,
          behavior: (windowHeight < 500) ? 'auto' : 'smooth',
        });
      }
    }
    // 이벤트 리스너 등록
    window.addEventListener('scroll', checkScrollPosition);

    // 정리 함수: 컴포넌트 언마운트 시 리스너 제거
    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', handleResize);
      unsubscribe_Test();
      unsubscribe_User();
    };
  }, [dailOpen, test]);

  const sum_open = Object.values(open).reduce((acc, value) => acc + value, 0);

  const btnclick = function (open, txt) {
    const newOpen = { ...open };
    if (!sum_open) {
      newOpen[txt] = true;
    } else {
      Object.keys(newOpen).forEach(key => {
        newOpen[key] = key === txt && !newOpen[key] ? true : false;
      });
    }
    setOpen(newOpen);
  };

  const currentButton = isWideScreen ? open['B'] : sum_open;

  async function loginfunc(userId, pwd) {
    try {
      await signInWithEmailAndPassword(auth, users[userId]['email'], pwd);
  
      const time = new Date().toISOString();
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();
      const fullUserData = { userId, time, ip: ipData.ip, name: users[userId].name };
      setUser(fullUserData);
      sessionStorage.setItem("user", JSON.stringify(fullUserData));
      console.log("Login successful:", fullUserData);
      return 0;
    } catch (error) {
      return error.message;
    }

  }


  const logoutfunc = () => {
    signOut(auth);
    setUser(null);
    sessionStorage.removeItem("user");
  };

  const openReservation = function (current) {
    setReserveOpen(true);
    setCurrentTime(current);
  }

  return (
    <div className="App">
      <div className='bar'>
        <div className='bar_'>
          <p className='title'>디지털정보관</p>
          <p className='title'> 스터디룸 대여</p>
        </div>
        <hr />
        <div className='login'>
          <Button
            sx={{
              fontSize: isWideScreen ? 28 : 14,
              color: 'white',
              borderColor: 'white',
            }}
            variant="outlined"
            onClick={user ? () => setMyPageOpen(true) : () => setDailOpen(true)}>
            {user ? user.name + '님' : 'Log in'}
            {/* 이름부분 */}
          </Button>
          <Loginform loginfunc={loginfunc} setDailOpen={setDailOpen} dailOpen={dailOpen} />
          <MyPage user={user} logoutfunc={logoutfunc} setMyPageOpen={setMyPageOpen} myPageOpen={myPageOpen} />
        </div>
      </div>
      <div className='btns'>
        <QuickButton user={user} open={open} func={btnclick} text="A" openReservation={openReservation} setDailOpen={setDailOpen} setLoginAlert={setLoginAlert}/>
        <div className="line" />
        <QuickButton user={user} open={open} func={btnclick} text="B" openReservation={openReservation} setDailOpen={setDailOpen} setLoginAlert={setLoginAlert} />
        <div className="line" />
        <QuickButton user={user} open={open} func={btnclick} text="C" openReservation={openReservation} setDailOpen={setDailOpen} setLoginAlert={setLoginAlert} />
      </div>

      <div className='fixbox'
        style={(currentButton) ? { transform: 'translateY(65px)' } : null}>
        <div
          className='tablebtn'>
          <Button sx={{
            fontSize: isWideScreen ? 28 : 16,
            borderRadius: '35px',
            bgcolor: '#ffffff',
            fontWeight: '600',
            color: '#42464f',
          }}
            variant="contained" endIcon={<ArrowForwardIosIcon />}
            onClick={() => setTablePageOpen(true)}>
            예약시간표
          </Button>
        </div>
        {windowSize.width > windowSize.height ?
          <TablePageRow user={user} setTablePageOpen={setTablePageOpen} tablePageOpen={tablePageOpen} openReservation={openReservation} setLoginAlert={setLoginAlert}/>
          : <TablePageColmn user={user} setTablePageOpen={setTablePageOpen} tablePageOpen={tablePageOpen} openReservation={openReservation} setLoginAlert={setLoginAlert}/>
        }
        <div
          className='help'>
          <IconButton aria-label="Example">
            <HelpIcon sx={{
              borderRadius: '35px',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              fontSize: isWideScreen ? 70 : 50
            }} />
          </IconButton>
        </div>
      </div>
      {currentTime && <ReservationPage user={user} setReserveOpen={setReserveOpen} reserveOpen={reserveOpen} currentTime={currentTime} />}
      
      <Dialog open={loginAlert} onClose={() => setLoginAlert(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{"테스트용"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {"로그인이 필요합니다. 123 123 ㄱㄱ"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setLoginAlert(false);setDailOpen(true)}} autoFocus>
            로그인
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}

export default App;

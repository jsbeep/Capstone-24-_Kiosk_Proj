import * as React from 'react';
import { useState, useEffect } from 'react';
import { dummy } from './test/example.js';
import QuickButton from './components/QuickButton';
import MyPage from './components/MyPage';
import Loginform from './components/Login';
import TablePageRow from './components/TablePage_Row.js';
import TablePageColmn from './components/TablePage_Column.js';
import ReservationPage from './components/Reservation.js';
import { db } from './test/firebase.js';

import { doc, onSnapshot } from 'firebase/firestore';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import HelpIcon from '@mui/icons-material/Help';
import './App.css';

const state = { "A": false, "B": false, "C": false };

function App() {
  const [user, setUser] = useState(null);
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
    const docRef = doc(db, "test", "test");
    const unsubscribe_Test = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setTest(doc.data());
        console.log(test.test);
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

  async function loginfunc(id) {
    const fetchData = async () => {
      try {
        const time = new Date().toISOString();
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();

        if (!dummy.account[id]) {
          throw new Error("Invalid user ID");
        }

        return { time, ip: ipData.ip, name: dummy.account[id].name };
      } catch (error) {
        throw new Error(`Data fetch failed: ${error.message}`);
      }
    };

    try {
      const userData = await fetchData();
      const fullUserData = { id, ...userData };
      setUser(fullUserData);
      sessionStorage.setItem("user", JSON.stringify(fullUserData));
      console.log("Login successful:", fullUserData);
    } catch (error) {
      console.error("Login failed:", error.message);
    }
  }


  const logoutfunc = () => {
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
            {user ? dummy.account[user.id].name + '님' : 'Log in'}
            {/* 이름부분 */}
          </Button>
          <Loginform loginfunc={loginfunc} setDailOpen={setDailOpen} dailOpen={dailOpen} />
          <MyPage user={user} logoutfunc={logoutfunc} setMyPageOpen={setMyPageOpen} myPageOpen={myPageOpen} />
        </div>
      </div>
      <div className='btns'>
        <QuickButton user={user} open={open} func={btnclick} text="A" openReservation={openReservation} setDailOpen={setDailOpen} />
        <div className="line" />
        <QuickButton user={user} open={open} func={btnclick} text="B" openReservation={openReservation} setDailOpen={setDailOpen} />
        <div className="line" />
        <QuickButton user={user} open={open} func={btnclick} text="C" openReservation={openReservation} setDailOpen={setDailOpen} />
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
          <TablePageRow user={user} setTablePageOpen={setTablePageOpen} tablePageOpen={tablePageOpen} openReservation={openReservation} />
          : <TablePageColmn user={user} setTablePageOpen={setTablePageOpen} tablePageOpen={tablePageOpen} openReservation={openReservation} />
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
      {/* {currentTime && <AdminPage user={user} setAdminOpen={setAdminOpen} adminOpen={adminOpen} currentTime={currentTime} />} */}
    </div>
  );
}

export default App;

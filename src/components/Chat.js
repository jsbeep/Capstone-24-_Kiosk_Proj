import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc, query, where, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "../test/firebase";
import { Box, TextField, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import HelpIcon from '@mui/icons-material/Help';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import HandymanIcon from '@mui/icons-material/Handyman';

const actions = [
    { icon: <EditIcon />, name: '자유', type: 0 },
    { icon: <HelpIcon size='small'/>, name: '문의', type: 1 },
    { icon: <HandymanIcon size='small'/>, name: '망치로때리겠다', type: 2 },
    { icon: <ThumbDownAltIcon size='small'/>, name: '별로', type: 3 },
    { icon: <ThumbUpAltIcon size='small'/>, name: '굿', type: 4 },
  ];


const Chat = ({user}) => {
const messagesEndRef = useRef(null);

  const [chapter, setChapter] = useState(0);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    let q = query(
      collection(db, "test", "chat", "messages"),
      orderBy("timestamp", "asc"),
      limit(50)
    );

    if (chapter) {
        q = query(q, where("chapter", "==", chapter)); // 'chapter' 필드가 chapter 변수와 일치하는 메시지만 가져옴
      }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [chapter]); 
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); 

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    await addDoc(collection(db, "test", "chat", "messages"), {
      text: newMessage,
      sender: user, // 사용자의 ID를 동적으로 넣으세요
      timestamp: new Date(),
      chapter: chapter
    });

    setNewMessage(""); // 입력창 초기화
  };
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);  // 메시지 전송 함수 호출
      setNewMessage("");        // 입력 필드 비우기
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();  // 기본 동작 (줄바꿈)을 방지
      handleSendMessage(); // 메시지 전송
    }
  };
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* 채팅 메시지 리스트 */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
        //   width: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'space-start',
          padding: 1,
          borderBottom: "1px solid #ccc",
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map((msg) => (
            <Box
                key={msg.id}
                sx={{
                display: "flex",
                flexDirection: "row",
            }}>

          <Box
            key={msg.id}
            sx={{
                display: "flex",
                flexDirection: "column",
                // marginBottom: 1,
                padding: 1,
                pr: 3,
                mb: 0,
                pb:0.5,
                pt:0.5
            }}
            >
            {/* 프로필과 이름 부분 */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                sx={{ marginRight: 1 }}
                size="small"
                aria-label="edit"
                >
                {actions[msg.chapter].icon}
              </IconButton>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {msg.sender[0] === "_" ? "익명" : msg.sender}
              </Typography>
            </Box>

            {/* 메시지 내용 */}
            <Typography variant="body2" sx={{ 
                p:2,
                fontSize: 16,
                marginLeft: 4,     
                borderRadius: 5,           
                backgroundColor: msg.sender[0] === "_" ? "#f0f0f0" : "#cce7ff",
                }}>
              {msg.text}
            </Typography>
          </Box>
                  </Box>
        ))}
        {/* 마지막 메시지로 스크롤 */}
        <div ref={messagesEndRef} />
      </Box>

      {/* 메시지 입력란 */}
      <Box
        sx={{
          display: "flex",
          padding: 2,
          alignItems: "center",
          borderTop: "1px solid #ccc",
          backgroundColor: "#fff",
        }}
      >
        <TextField
          fullWidth
          inputProps={{ maxLength: 100 }}
          variant="outlined"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            marginRight: 1,
            borderRadius: 1,
            "& .MuiInputBase-input": {
                p: 0,
                pl:2,
                pr:6,
                height: 45,
            },
            "& .MuiOutlinedInput-root": {
              borderRadius: "55px",
            },
          }}
        />
        <Box sx={{ flexGrow: 1 }}>
      <SpeedDial
        ariaLabel="SpeedDial openIcon example"
        sx={{ position: 'absolute', bottom: 20, right: 20,
            '& .MuiButtonBase-root': {
                boxShadow: 1,
                width: 38,
                height: 38
            }
         }}
        icon={<SpeedDialIcon openIcon={<EditIcon />} />}
      >
        {actions.map((action, index) => {
            if (!index) 
                return null;
            return <SpeedDialAction
            sx={{
                color: chapter === action.type ? '#1976d2' : '#8c8c8c',
            }}
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={chapter === action.type ? ()=>setChapter(0) : ()=>setChapter(action.type)}
          />
        })}
      </SpeedDial>
    </Box>
      </Box>
    
    </Box>
  );
};

export default Chat;
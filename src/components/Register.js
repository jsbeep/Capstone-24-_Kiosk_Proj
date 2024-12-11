import React, { useState, useEffect } from "react";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../test/firebase.js";
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  FilledInput,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";

const docRef_user = doc(db, "test", "user");

function RegisterForm({ registerFunc, setDialogOpen, dialogOpen }) {
  const [user, setUser] = useState(null);
  const [studentID, setSID] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { 
    const unsubscribe_user = onSnapshot(docRef_user, (doc) => {
      setUser(doc.data());
    });
    // 컴포넌트 언마운트 시 리스너 정리
    return () => unsubscribe_user();
  },[]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("모든 필드를 채워주세요.");
      return;
    }
    if (password !== confirmPassword) {
      setError("PIN 번호가 일치하지 않습니다.");
      return;
    }
    if (studentID in user){
      setError("이미 존재하는 학번입니다.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateDoc(docRef_user, {
        [studentID]: {
          name: name,
          email: email,
        },  // 동적으로 필드와 값을 설정
      });
      alert("회원가입 성공!");
      setDialogOpen(false);
      setError("");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("이미 존재하는 이메일입니다.");
      } else {
        console.log(err)
        setError("회원가입에 실패하였습니다. 다시 시도해 주세요.");
      }
    }
  };
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  return (
    <React.Fragment>
      <Dialog
        fullWidth
        maxWidth={"sm"}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "#092979",
            color: "#ffffff",
            borderRadius: 3,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.5)",
            alignItems: "center",
            height: "80vh",
          },
        }}
      >
        <DialogTitle>회원가입</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // mt: "20px",
            mb: "60px",
            ".MuiInputBase-root": { borderRadius: "15px" },
            "& .MuiInputBase-input": { color: "white" },
            ".MuiFilledInput-root": { bgcolor: "#3c59a3" },
            "& .MuiInputLabel-root": { color: "#7792d4" },
            "& .MuiInputLabel-root.Mui-focused": { color: "#acbeea" },
            "& .MuiInputLabel-root.Mui-error": { color: "#dc3545" },
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: "250px" }}
          >

            <TextField
              variant="filled"
              margin="normal"
              required
              fullWidth
              id="sid"
              label="학번"
              inputProps={{ inputMode: 'numeric', maxLength: 7 }}
              name="sid"
              autoFocus
              value={studentID}
              onChange={(e) => setSID(e.target.value)}
            />
            <TextField
              variant="filled"
              margin="normal"
              required
              fullWidth
              id="name"
              label="이름"
              name="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              variant="filled"
              margin="normal"
              required
              fullWidth
              id="email"
              label="이메일"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormControl fullWidth required variant="filled" margin="normal">
              <InputLabel htmlFor="password">PIN 번호</InputLabel>
              <FilledInput
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      sx={{ color: "#ffffff" }}
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
              <DialogContentText sx={{ color: "#3c59a3" }}>
                PIN 번호: 숫자 6자리
              </DialogContentText>
            <FormControl fullWidth required variant="filled" margin="normal">
              <InputLabel htmlFor="confirm-password">PIN 번호 확인</InputLabel>
              <FilledInput
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                onChange={(e) => setConfirmPassword(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      sx={{ color: "#ffffff" }}
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 3,
                bgcolor: "#ffffff",
                color: "#092979",
                height: "45px",
              }}
            >
              회원가입
            </Button>
            {error && (
              <Typography color="error" variant="body2" align="center">
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            sx={{
              color: "#acbeea",
              position: "absolute",
              bottom: "25px",
              right: "25px",
              border: "1px solid black",
              borderColor: "#acbeea",
            }}
            onClick={() => setDialogOpen(false)}
          >
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default RegisterForm;
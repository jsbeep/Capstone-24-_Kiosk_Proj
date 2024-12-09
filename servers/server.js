const express = require("express");
const admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert(require("../../serviceAccountKey.json")),
    databaseURL: "https://test-4d484.firebaseio.com"  // Firestore URL
});
  
const db = admin.firestore();
const app = express();

const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');  // 시간 (두 자리로 맞추기)
    const minutes = now.getMinutes().toString().padStart(2, '0');  // 분 (두 자리로 맞추기)
    return `${hours}:${minutes}`;
}

const IndexToTime = function (index) {
    const hours = String(Math.floor(index / 2) + 6).padStart(2, '0'); // 06부터 시작
    const minutes = index % 2 === 0 ? '00' : '30'; // 0은 ':00', 1은 ':30'
    const time = `${hours}:${minutes}`;
    return time
}

const TimeToIndex = function (time) {
    const [hours, minutes] = time.split(':').map(Number);  // 시간을 ':' 기준으로 분리하고 숫자로 변환
    const index = (hours - 6) * 2 + (minutes === 30 ? 1 : 0);  // 06:00부터 시작하는 인덱스 계산
    return index<0 ? 0 : index;
};

const docRef_room = db.collection("test").doc("room");

const monitorAndUpdate = async () => {
    try {
        const currentTime = getCurrentTime();
        const currentTimeIndex = TimeToIndex(currentTime);

        console.log(currentTime, currentTimeIndex, IndexToTime(currentTimeIndex))
        // Firebase 데이터 업데이트
        await docRef_room.update({ 
            // currentTime: currentTime,
            currentTimeIndex: currentTimeIndex+1
        });

        if (!currentTimeIndex){
            let current_room = (await docRef_room.get()).data();
            Object.keys(current_room).forEach(key => {
                if (['A', 'B', 'C'].includes(key)) {
                    current_room[key].Reserve.day1 = current_room[key].Reserve.day1.map((value, index) => value === 2 ? 0 : value
                    );
                }
            });
            docRef_room.update(current_room).then(() => {
            console.log("key 값이 성공적으로 업데이트되었습니다.");
            }).catch((error) => {
            console.error("key 업데이트 중 오류:", error);
            });
        }

        console.log(`Updated currentTime to: ${currentTime}`);
    } catch (error) {
        console.error("Error updating document: ", error);
    }
};

const snapshotUpdate = async () => {
    try {
        const currentTime = getCurrentTime();
        const currentTimeIndex = TimeToIndex(currentTime);

        docRef_room.onSnapshot((doc) => {
        if (doc.exists && currentTimeIndex) {
            let current_room = doc.data();

            Object.keys(current_room).forEach(key => {
                // 'A', 'B', 'C'만 처리
                if (['A', 'B', 'C'].includes(key)) {
                  // Reserve 배열의 처음 10개 인덱스를 확인하고 값이 0이면 2로 변경
                  current_room[key].Reserve.day1 = current_room[key].Reserve.day1.map((value, index) => 
                    index < current_room['currentTimeIndex'] && value === 0 ? 2 : value
                  );
                }
              });

            // 'key' 업데이트
            docRef_room.update(current_room).then(() => {
            console.log("key 값이 성공적으로 업데이트되었습니다.");
            }).catch((error) => {
            console.error("key 업데이트 중 오류:", error);
            });
        }
        });
    } catch (error) {
        console.error("Firestore 실시간 업데이트 감지 중 오류:", error);
    }
};

// 매 1분마다 실행 (60000ms = 1분)
setInterval(monitorAndUpdate, 5000);
snapshotUpdate();

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

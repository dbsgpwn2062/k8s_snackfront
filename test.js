const fs = require("fs");
const mongoose = require("mongoose");

const GUESTBOOK_DB_ADDR = "192.168.56.101:17017"; // MongoDB 주소
const mongoURI = `mongodb://${GUESTBOOK_DB_ADDR}/snacks`;

// MongoDB 연결
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const snackSchema = new mongoose.Schema({
  image: String,
  name: String,
  "Nutritional Ingredients": Object,
});

const Snack = mongoose.model("Snack", snackSchema);

// 로컬 이미지 파일 경로 배열
const imagePaths = [
  "C:\\Users\\user\\Desktop\\rapa과자\\마가렛트_모카.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\마가렛트_오리지널.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\망고젤리.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\몽쉘.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\밀크클래식쌀과자.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\밀크클래식쌀과자_치즈.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\버터와플.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\빠다코코낫.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\뽀또.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\예감_오리지널.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\예감_치즈그라탕.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\오뜨_쇼콜라.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\오뜨_치즈.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\오예스.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\오예스_쿠키앤크림.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\오예스_피스타치오.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\자유시간.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\참쌀선과.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\초코파이.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\쵸코하임.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\카스타드.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\쿠크다스.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\크라운산도.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\트윅스.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\하리보.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\후레쉬베리.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\후레쉬베리_복숭아.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\후레쉬베리_요거트베리.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\후렌치파이_딸기.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\후렌치파이_사과.png",
  "C:\\Users\\user\\Desktop\\rapa과자\\후렌치파이_오미자청.png",
];

const updateImages = async () => {
  const snacks = await Snack.find(); // MongoDB에서 모든 스낵 데이터 가져오기

  for (let i = 0; i < imagePaths.length; i++) {
    const path = imagePaths[i];

    try {
      // 이미지 파일을 읽고 Base64로 인코딩
      const imageData = fs.readFileSync(path);
      const base64Image = imageData.toString("base64");
      const imageUrl = `data:image/png;base64,${base64Image}`;

      // MongoDB에서 해당 스낵을 이름으로 찾아 업데이트
      await Snack.updateOne(
        { name: snacks[i].name }, // 기존 스낵 이름으로 찾아서 업데이트
        { image: imageUrl }
      );

      console.log(`Updated image for snack: ${snacks[i].name}`);
    } catch (error) {
      console.error(
        `Error processing image for snack: ${snacks[i].name}, ${error.message}`
      );
    }
  }

  mongoose.disconnect(); // MongoDB 연결 종료
};

updateImages();

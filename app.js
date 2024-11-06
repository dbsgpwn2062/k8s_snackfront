require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
const multer = require("multer"); // 파일 업로드를 위한 multer 모듈 추가
const cookieParser = require("cookie-parser");
const util = require("./utils");
const GUESTBOOK_API_ADDR = process.env.GUESTBOOK_API_ADDR;

const BACKEND_URI = `${GUESTBOOK_API_ADDR}/snacks`;

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, "views")));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Multer 설정 (파일 업로드)
const upload = multer({ dest: "uploads/" });

const router = express.Router();
app.use(router);

// 환경변수 확인
if (!process.env.PORT) {
  const errMsg = "PORT environment variable is not defined";
  console.error(errMsg);
  throw new Error(errMsg);
}

if (!process.env.GUESTBOOK_API_ADDR) {
  const errMsg = "GUESTBOOK_API_ADDR environment variable is not defined";
  console.error(errMsg);
  throw new Error(errMsg);
}

// 서버 시작
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});

// 홈 페이지 라우트에서 스낵 데이터를 가져와서 렌더링
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(BACKEND_URI);
    const snacks = response.data; // snacks 데이터를 가져옴
    const isUserLoggedIn = req.cookies.user === "true"; // 쿠키에서 로그인 상태 확인

    // 로그 출력
    console.log("User Logged In:", isUserLoggedIn);
    console.log("Snacks Data:", snacks);

    res.render("home", { snacks, user: isUserLoggedIn }); // snacks와 로그인 상태를 함께 전달
  } catch (error) {
    console.error("Error fetching snacks:", error);
    res.render("home", { snacks: [], user: false }); // 에러 발생 시 빈 배열과 로그인 상태 false로 렌더링
  }
});

// Handles POST request to /post
router.post("/post", upload.single("photo"), (req, res) => {
  const snackName = req.body.snackName;
  const nutritionInfo = req.body.nutritionInfo;
  const photo = req.file ? req.file.filename : null;

  if (!snackName || snackName.length == 0) {
    res.status(400).send("과자 이름을 입력하세요.");
    return;
  }

  axios
    .post(BACKEND_URI, {
      name: snackName,
      nutritionalIngredients: nutritionInfo,
      image: photo,
    })
    .then((response) => {
      console.log(`response from ${BACKEND_URI}` + response.status);
      res.redirect("/");
    })
    .catch((error) => {
      console.error("error: " + error);
    });
});

module.exports = app;

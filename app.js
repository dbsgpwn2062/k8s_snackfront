require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const util = require("./utils");

const GUESTBOOK_API_ADDR = process.env.GUESTBOOK_API_ADDR;
const BACKEND_URI = `${GUESTBOOK_API_ADDR}/snacks`;
const PORT = process.env.PORT || 3001;

// 환경 변수 체크
if (!GUESTBOOK_API_ADDR) {
  console.error("GUESTBOOK_API_ADDR environment variable is not defined");
  throw new Error("GUESTBOOK_API_ADDR environment variable is not defined");
}
if (!process.env.PORT) {
  console.error("PORT environment variable is not defined");
  throw new Error("PORT environment variable is not defined");
}

// 설정
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// 미들웨어 설정
app.use("/js", express.static(path.join(__dirname, "views/js")));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 파일 업로드 설정
const upload = multer({ dest: "uploads/" });

// 홈 페이지 라우트에서 스낵 데이터를 가져와서 렌더링
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(BACKEND_URI);
    const snacks = response.data;
    const isUserLoggedIn = req.cookies.user === "true";

    console.log("User Logged In:", isUserLoggedIn);
    console.log("Snacks Data:", snacks);

    res.render("home", { snacks, user: isUserLoggedIn });
  } catch (error) {
    console.error("Error fetching snacks:", error);
    res.render("home", { snacks: [], user: false });
  }
});
/*
// POST 요청을 처리하여 새로운 스낵 추가
app.post("/post", (req, res) => {
  console.log(req.body);
  const { name, nutritionalIngredients, image } = req.body;

  if (!name || name.length === 0) {
    return res.status(400).send("과자 이름을 입력하세요.");
  }

  axios
    .post(BACKEND_URI, {
      name: name,
      nutritionalIngredients: nutritionalIngredients,
      image: image,
    })
    .then((response) => {
      console.log(`response from ${BACKEND_URI}: ${response.status}`);
      res.status(200).send("Snack added successfully");
    })
    .catch((error) => {
      console.error("Error posting snack:", error);
      res.status(500).send("Error posting snack");
    });
});*/

// 서버 시작
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

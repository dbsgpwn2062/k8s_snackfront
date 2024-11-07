require("dotenv").config();
const express = require("express");
const path = require("path");
const axios = require("axios");
const bodyParser = require("body-parser");
const multer = require("multer");
const cookieParser = require("cookie-parser");

const app = express();
const GUESTBOOK_API_ADDR = process.env.GUESTBOOK_API_ADDR;
const BACKEND_URI = `http://${GUESTBOOK_API_ADDR}/users/login`;
const SNACK_URI = `http://${GUESTBOOK_API_ADDR}/snacks`;
const LIKE_SNACK_URI = `http://${GUESTBOOK_API_ADDR}/snacks/required`;
const PORT = process.env.PORT || 3001;

// 환경 변수 체크
if (!GUESTBOOK_API_ADDR || !process.env.PORT) {
  console.error("Required environment variables are not defined.");
  throw new Error("Required environment variables are not defined.");
}

// 설정
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// 미들웨어 설정
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
    const response = await axios.get(SNACK_URI);
    const snacks = response.data;
    const isUserLoggedIn = req.cookies.user === "true";
    res.render("home", { snacks, user: isUserLoggedIn });
  } catch (error) {
    console.error("Error fetching snacks:", error);
    res.render("home", { snacks: [], user: false });
  }
});

// 로그인 요청을 처리하는 라우트 추가
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const response = await axios.get(BACKEND_URI, {
      params: { userName: username, userPass: password },
      withCredentials: true,
    });

    if (response.data.num) {
      res.cookie("user", "true", {
        httpOnly: false,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "Lax",
      });
      res.status(200).json({ message: "로그인 성공" });
    } else {
      res.status(401).json({ message: "로그인 실패. 다시 시도해 주세요." });
    }
  } catch (error) {
    console.log("로그인 요청 중 오류 발생:", error);
    res.status(500).json({ message: "서버 오류. 나중에 다시 시도해 주세요." });
  }
});

// 로그아웃 요청을 처리하는 라우트 추가
app.post("/logout", (req, res) => {
  res.clearCookie("user");
  res.status(200).json({ message: "로그아웃 성공" });
});

// 좋아요 기능을 처리하는 라우트 추가
app.post("/like-snack", async (req, res) => {
  const { snackName } = req.body;

  if (!snackName) {
    return res.status(400).json({ message: "Snack name is required" });
  }

  try {
    const response = await axios.post(`${LIKE_SNACK_URI}?name=${snackName}`, {}, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      res.status(200).json({ message: `Successfully liked ${snackName}` });
    } else {
      res.status(response.status).json({ message: "Failed to like snack" });
    }
  } catch (error) {
    console.error("Error liking snack:", error);
    res.status(500).json({ message: "An error occurred while liking the snack." });
  }
});

// 스낵 추가 요청을 처리하는 라우트 추가
app.post("/submit-snack", upload.single("photo"), async (req, res) => {
  const { snackName, calories, carbohydrates, protein, fat } = req.body;
  const image = req.file ? req.file.path : null; // 이미지 경로 저장

  if (!snackName || !image) {
    return res.status(400).json({ message: "Snack name and image are required." });
  }

  try {
    const base64Image = `data:image/png;base64,${Buffer.from(image).toString("base64")}`;

    const snackData = {
      name: snackName,
      nutritionalIngredients: {
        칼로리: `${calories} kcal`,
        탄: `${carbohydrates} g`,
        단: `${protein} g`,
        지: `${fat} g`,
      },
      image: base64Image,
    };

    const response = await axios.post(SNACK_URI, snackData, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 201) {
      res.status(201).json({ message: "Snack successfully added to MongoDB!" });
    } else {
      res.status(response.status).json({ message: "Failed to add snack." });
    }
  } catch (error) {
    console.error("Error submitting snack:", error);
    res.status(500).json({ message: "An error occurred while submitting the snack." });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

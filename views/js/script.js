const PORT = process.env.PORT;

// 환경 변수 체크
if (!process.env.PORT) {
  console.error("PORT environment variable is not defined");
  throw new Error("PORT environment variable is not defined");
}

// 로그인 관련 기능이 모두 제거된 상태
console.log("Welcome to Today's Snack!");

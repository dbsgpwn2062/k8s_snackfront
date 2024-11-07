const GUESTBOOK_API_ADDR = process.env.GUESTBOOK_API_ADDR;
const BACKEND_URI = `http://${GUESTBOOK_API_ADDR}/users/login`;
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
// 모달 열기
function openModal() {
  document.getElementById("loginModal").style.display = "block";
}
window.openModal = openModal;

// 모달 닫기
function closeModal() {
  document.getElementById("loginModal").style.display = "none";
}
window.closeModal = closeModal;

// 모달 외부 클릭 시 닫기
window.onclick = function (event) {
  var modal = document.getElementById("loginModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

function logout() {
  document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // 쿠키 삭제
  location.reload(); // 페이지 새로고침하여 로그인 상태 갱신
}
window.logout = logout;

// 로그인 제출 함수

async function submitLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    if (response.ok) {
      showAlert("로그인 성공!", true);
      closeModal();
      location.reload(); // 페이지 새로고침하여 쿠키 기반 로그인 상태 반영
    } else {
      showAlert(result.message, false);
    }
  } catch (error) {
    console.log("로그인 요청 중 오류 발생:", error);
    showAlert("서버 오류. 나중에 다시 시도해 주세요.", false);
  }
}



// 알림 표시 함수
function showAlert(message, type) {
  const alertBox = document.createElement("div");
  alertBox.classList.add(
    "login-alert",
    type === "success" ? "login-alert-success" : "login-alert-danger"
  );
  alertBox.textContent = message;
  document.body.appendChild(alertBox);
  setTimeout(() => {
    alertBox.remove();
  }, 3000);
}
window.showAlert = showAlert;

// 페이지 로드 시 쿠키를 통해 로그인 상태 확인
// 로그인 상태 확인 및 버튼 설정
window.addEventListener("load", () => {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith("user="))
    ?.split("=")[1];

  console.log("Cookie Value:", cookieValue); // 쿠키 값을 직접 출력
  const isLoggedIn = cookieValue === "true";

  const loginButton = document.querySelector(".login-button");
  if (isLoggedIn) {
    loginButton.textContent = "LOGOUT";
    loginButton.setAttribute("onclick", "logout()");
  } else {
    loginButton.textContent = "LOGIN";
    loginButton.setAttribute("onclick", "openModal()");
  }
});



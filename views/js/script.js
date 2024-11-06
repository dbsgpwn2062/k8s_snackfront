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
    const response = await axios.get("http://localhost:3000/users/login", {
      params: { userName: username, userPass: password },
      withCredentials: true,
    });

    if (response.data.num) {
      // 로그인 성공 시 페이지 새로고침하여 쿠키 반영
      showAlert("로그인 성공!", true);
      closeModal();
      location.reload(); // 페이지 새로고침하여 쿠키 기반 로그인 상태 반영
    } else {
      showAlert("로그인 실패. 다시 시도해 주세요.", false);
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

async function submitSnack(event) {
  event.preventDefault();

  const name = document.getElementById("snackName").value;
  const imageFile = document.getElementById("photo").files[0];
  const calories = document.getElementById("calories").value || "정보 없음";
  const carbohydrates =
    document.getElementById("carbohydrates").value || "정보 없음";
  const protein = document.getElementById("protein").value || "정보 없음";
  const fat = document.getElementById("fat").value || "정보 없음";

  // 이미지 파일이 있는지 확인
  if (!imageFile) {
    alert("Please select an image file.");
    console.error("No image file selected.");
    return;
  }

  const reader = new FileReader();

  reader.onloadend = async () => {
    const base64Image = reader.result;

    // 서버로 전송할 데이터 객체 생성
    const snackData = {
      name: name,
      nutritionalIngredients: {
        칼로리: calories + " kcal",
        탄: carbohydrates + " g",
        단: protein + " g",
        지: fat + "g",
      },
      image: base64Image,
    };

    try {
      const response = await fetch("http://localhost:3000/snacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(snackData),
      });

      if (response.ok) {
        alert("Snack successfully added to MongoDB!");
        document.getElementById("snackForm").reset();
      } else {
        const error = await response.json();
        alert("Failed to add snack: " + error.message);
      }
    } catch (error) {
      console.error("Error submitting snack:", error);
      alert("An error occurred while submitting the snack.");
    }
  };
  reader.readAsDataURL(imageFile);
}

async function likeSnack(snackName) {
  try {
    const response = await fetch(
      `http://localhost:3000/snacks/required?name=${snackName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      // 서버에서 성공적으로 처리한 경우, 페이지를 새로고침하여 업데이트 반영
      location.reload();
    } else {
      console.error("Failed to like snack");
      const errorData = await response.json();
      alert(`Failed to like snack: ${errorData.message}`);
    }
  } catch (error) {
    console.error("Error liking snack:", error);
    alert("An error occurred while liking the snack.");
  }
}

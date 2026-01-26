console.log("auth.js loaded"); // DEBUG LINE

// =====================
// Default user setup
// =====================
(function () {
  if (!localStorage.getItem("registeredUsers")) {
    const users = [
      {
        username: "kgl_admin",
        password: "groceries2026",
        role: "Manager"
      }
    ];
    localStorage.setItem("registeredUsers", JSON.stringify(users));
  }
})();

// =====================
// Toast
// =====================
function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// =====================
// Login
// =====================
function login(event) {
  event.preventDefault();

  console.log("Login clicked"); // DEBUG

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  if (!username || !password) {
    showToast("Please enter both username and password.", "error");
    return;
  }

  const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
  const user = users.find(u => u.username === username);

  if (!user) {
    showToast("Username does not exist.", "error");
    return;
  }

  if (user.password !== password) {
    showToast("Incorrect password. Please try again.", "error");
    return;
  }

  if (user.role.toLowerCase() !== role) {
    showToast("Role does not match this account.", "error");
    return;
  }

  localStorage.setItem(
    "currentSession",
    JSON.stringify({
      username: user.username,
      role: user.role
    })
  );

  showToast("Login successful!", "success");

  setTimeout(() => routeUser(user.role), 1000);
}

// =====================
// Routing
// =====================
function routeUser(role) {
  if (role === "Manager") {
    window.location.href = "../manager/manager-dashboard.html";
  } else if (role === "Director") {
    window.location.href = "../director/director-dashboard.html";
  } else if (role === "Sales Agent") {
    window.location.href = "../salesAgent/sales-agent-dashboard.html";
  }
}

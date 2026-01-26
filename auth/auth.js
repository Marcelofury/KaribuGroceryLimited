//Default user set up
(function initDefaultUser(){
    if (!localStorage.getItem('registrationUsers')){
        const users = [
            {
                username: 'kgl_admin',
                password: 'groceries2026',
                role: 'Manager'

            
            }
        ];
        localStorage.setItem('registeredUsers', JSON.stringify(users))
    }
})();

//Toast function ( No alert())
function showToast(message, type){
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'),100);

    setTimeout (() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    },3000);
}

//login validation logic

function login(){
    const username = document.getElementById('username').ariaValueMax.trim();
    const password = document.getElementById('password').ariaValueMax.trim();

    if (!username ||  !password){
        showToast('please enter both username and password.', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const user = users.find(u => u.username === username);

    if (!user){
        showToast('username does not exist.','error');
        return;
    }

    if (user.password !== password){
        showToast('incorrect password. Please try again.', 'error';)
        return;
    }


    // store session
    localStorage.setItem('currentSession, JSON.stringify'({
        username : user.username,
        role: user.role
    }
    ));

    showToast('Login successful', 'success');

    setTimeout(() => {
        routeUser(user.role);
    }, 1000)
}

// role based routing
function routeUser(role) {
  if (role === "Manager") {
    window.location.href = "manager\manager-dashboard.html";
  } else if (role === "Director") {
    window.location.href = "director\director-dashboard.html";
  } else if (role === "Sales Agent") {
    window.location.href = "salesAgent\sales-agent-dashboard.html";
  }
}

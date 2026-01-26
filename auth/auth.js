Default user set up
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
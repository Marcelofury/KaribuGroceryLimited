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


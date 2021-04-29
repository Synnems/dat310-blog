let index = {
    template: `
        <div class="row">
            <div class="leftcolumn">
                <div class="card">
                    <h2>PLACEHOLDER TITLE</h2>
                    <h5>Apr 19, 2021</h5>
                    <img id = "bloggImg" src="static/img/python_code.jpg" alt="PythonImg">
                    <p>PLACEHOLDER BLOG TEXT</p>
                    <div class="commentSection">
                        <h3>Comments:</h3>
                        <p>User1: Great post!</p>
                    </div>
                </div>
            </div> 
            <div class="rightcolumn">
                <div class="card">
                    <div class="dropdown">
                        <span id='menu'>Menu ▼</span>
                        <div id = 'dropdown' class="dropdown-content">
                            <router-link to='/login'><p v-show='!login'>Login</p></router-link>
                            <router-link to='/register'><p>Register</p></router-link>
                            <p v-show='login == true'>Logout</p>
                            <p v-show='login == true'>User profile</p>
                        </div>
                    </div>
                </div>
  
                <div class="card">
                    <div id="searchAndSort">
                        <input type="text" placeholder="Search">
                        <select name="sort" id="sort">
                            <option selected disabled>Sort by</option>
                            <option value="Comments">Most commented</option>
                            <option value="recent">Most recent</option>
                        </select>
                    </div>
                </div>
  
                <div class="card">
                    <h2>About Me</h2>
                    <img id="aboutImg" src="static/img/bloggBilde.jpg" alt="ProgrammingGirl">
                    <p>My name is Synne and I am a 21 years old Computer Science student. In my sparetime I enjoy coding, especially in Python. In this blog I am going to to share my journey in becomming a better programmer.</p>
                </div>
            </div>
         </div>
         `,

}

let login = {
    template: `<div class="row">
                    <div class="leftcolumn">
                        <div class="card">
                            <div id="login">
                                <h1>Log in</h1>
                                <label for="username">Username: </label>
                                <input type="text" id="username" name="username" v-model='username'><br><br>
                                <label for="password">Password: </label>
                                <input type="password" id="password" name="password" v-model='password'><br><br>
                                <button @click='loginMet()'>Enter</button>
                            </div>
                        </div>
                    </div>
  
                    <div class="rightcolumn">
                        <div class="card">
                            <h2>About Me</h2>
                            <img id="aboutImg" src="static/img/bloggBilde.jpg" alt="ProgrammingGirl">
                            <p>My name is Synne and I am a 21 years old Computer Science student. In my sparetime I enjoy coding, especially in Python. In this blog I am going to to share my journey in becomming a better programmer.</p>
                        </div>
                    </div>
                </div>`,  
        data(){ 
            return{
                input: {
                    login: false,
                    username: '',
                    password: '',
                }
            }
        },
        methods: {
            loginMet: async function() {
                let login = Vue.reactive({username: this.username, password: this.password, login: this.login}) //Will be automatically updated when the data changes.
                let request = await fetch("/login", { //POST request to backend Flask /login
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(login)
                });

                if (request.status == 200){ //200: Response is ready
                    let result = await request.json();
                    this.input = result;
                }

                if (this.input.login == true){ //True if login is succsessfull
                    router.push({ path: '/'})
                }
                else{
                    alert("The username and/or password is incorrect");
                }
            },
        }    
}

let register = {
    template: `
        <div class="row">
            <div class="leftcolumn">
                <div class="card">
                    <div id="register">
                        <h1>Register</h1>
                        <label for="username">Enter a username: </label>
                        <input type="text" id="username" name="username" placeholder="Username" v-model = 'username'><br><br>
                        <label for="password">Enter a password: </label>
                        <input type="password" id="password" name="password" placeholder = 'Password' v-model='password'><br><br>
                        <button @click='registerMet()'>Register</button>
                    </div>
                </div>

                <div class="card">
                    <h4>Do Not Share Your Password!</h4>
                    <p>Passwords are a major defense against hackers, and developing good password practices will help keep your sensitive personal information and identity more secure.</p>
                </div>
            </div>

        <div class="rightcolumn">
            <div class="card">
                <h2>About Me</h2>
                <img id="aboutImg" src="static/img/bloggBilde.jpg" alt="ProgrammingGirl">
                <p>My name is Synne and I am a 21 years old Computer Science student. In my sparetime I enjoy coding, especially in Python. In this blog I am going to to share my journey in becomming a better programmer.</p>
            </div>
        </div>
    </div>
    `,
    data(){
        return{
            inputRegister: {
                addSuccess: false,
                username: '',
                password: '',
            }
        }
    },
    methods: {
        registerMet: async function() {
            let register = Vue.reactive({username: this.username, password: this.password}) //Will be automatically updated when the data changes.
            let request = await fetch("/register", { //POST request to backend Flask /register
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(register)
            });
            
            if (request.status == 200){ //200: Response is ready
                let result = await request.json();
                this.inputRegister = result;
                router.push({ path: '/'})
            }

        },
    }    
}

let router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: [
        {path: '/', component: index},
        {path: '/login', component: login, props: {login: this.login}},
        {path: '/register', component: register}
    ]
})


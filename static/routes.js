let index = {
    template: `
        <div class="row">
            <div class="leftcolumn">
                <div class="card" v-for="post in filteredList">
                    <router-link :to="{ name: 'index', params: { postid: post.postid }}"><h2> {{post.title}} </h2></router-link>
                    <h5>Apr 19, 2021</h5>
                    <img id = "bloggImg" v-bind:src="'/static/img/' + post.imgUrl">
                    <p>{{post.content}}</p>
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
                            <router-link to='/login' v-if="loggedIn == false"><p>Login</p></router-link>
                            <router-link to='/login' v-if="loggedIn == true" @click= 'logoutMet()'><p>Logout</p></router-link>
                            <router-link to='/register' v-if="loggedIn == false"><p>Register</p></router-link>
                            <router-link to='/post' v-if="loggedIn == true && admin == true"><p>Post</p></router-link>
                        </div>
                    </div>
                </div>
  
                <div class="card">
                    <div id="searchAndSort">
                        <input type="text" placeholder="Search title" v-model="search">
                       <div> 
                            <input type="radio" id="lightmode" name="lightmode" value="lightmode" v-model='lightmode'checked>
                            <label for="lightmode">Lightmode</label>

                            <input type="radio" id="darkmode" name="darkmode" value="darkmode" v-model='darkmode'>
                            <label for="darkmode">Darkmode</label>
                        </div>
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
         data(){ 
            return{
                posts: [],
                loggedIn: false,
                admin: false,
                search: ''
            }
        },
        created: async function(){
            let request = await fetch("/get_post")

            if (request.status == 200){ //200: Response is ready
                let result = await request.json();
                this.posts = result;
            }

            let myValue = localStorage.getItem('User');
                if (myValue != null){
                    this.loggedIn = true
                }

            let roleValue = localStorage.getItem('Role');
                if (roleValue == 'admin'){
                    this.admin = true
                }

         },
        methods: {
             logoutMet: async function(){
                localStorage.removeItem('User');
                localStorage.removeItem('Role');
                this.loggedIn = false;
                this.admin = false;
            },
        },
        computed: {
            filteredList() {
                return this.posts.filter(post => {
                    return post.title.toLowerCase().includes(this.search.toLowerCase())
                  })
                },
        }
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
                            <p>Not a user yet? Register <router-link to='/register'>here!</router-link></p>
                        </div>
                    </div>
  
                    <div class="rightcolumn">
                        <div class="card">
                            <h4>Back to <router-link to='/'>index</router-link></h4>
                        </div>
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
                    role: ''
                }
            }
        },
        created: async function(){
            let myValue = localStorage.getItem('User');
                if (myValue != null){
                    router.push({path: '/'})
                }
        },
        methods: {
            loginMet: async function() {
                let login = Vue.reactive({username: this.username, password: this.password, login: this.login, role: this.role}) //Will be automatically updated when the data changes.
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
                    localStorage.setItem('User', this.username);
                    localStorage.setItem('Role', this.input.role)
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
                    <p>Already a user? Login <router-link to='/login'>here!</router-link></p>
                </div>

                <div class="card">
                    <h4>Do Not Share Your Password!</h4>
                    <p>Passwords are a major defense against hackers, and developing good password practices will help keep your sensitive personal information and identity more secure.</p>
                </div>
            </div>

        <div class="rightcolumn">
            <div class="card">
                <h4>Back to <router-link to='/'>index</router-link></h4>
            </div>
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
    created: async function(){
        let myValue = localStorage.getItem('User');
            if (myValue != null){
                router.push({path: '/'})
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
                router.push({ path: '/login'})
            }

        },
    }    
}

let post = {
    template: `
    <div class="row">
        <div class="leftcolumn">
            <div class="card">
                <div id="post">
                    <h1>Post</h1>
                    <input type="text" name="title" placeholder="Title" v-model = 'title'><br><br>
                    <textarea id="textfield" name="textfield" rows="10" cols="100" v-model = 'content'></textarea>
                </div>
                <input type='file'  accept="image/png, image/jpeg" v-model= 'imgUrl' @change='onFileChange'>
                <button @click= 'onUpload'>Submit</button>
            </div>
        </div>
        <div class="rightcolumn">
            <div class="card">
                <h4>Back to <router-link to='/'>index</router-link></h4>
            </div>
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
            inputPost: {
                posted: false,
                imgUrl: null,
                title: '',
                content: '',
            }
        }
    },
    created: async function(){
        let myValue = localStorage.getItem('User');
        let roleValue = localStorage.getItem('Role')
            if (myValue == null || roleValue != 'admin'){
                router.push({path: '/'})
            }

            
    },
    methods: {
        onFileChange(event) {
            var filedata = event.target.files[0];
            this.imgUrl = filedata.name;
        },
        onUpload: async function(){
            let post = Vue.reactive({imgUrl: this.imgUrl, title: this.title, content: this.content, posted: this.posted}) //Will be automatically updated when the data changes.
            let request = await fetch("/post", { //POST request to backend Flask /post
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(post)
            });
            
            if (request.status == 200){ //200: Response is ready
                let result = await request.json();
                this.inputPost = result;
                console.log(result)
                router.push({ path: '/'})
            }

        }
    }
    
}

let singlePost = {
    template: `
        <div class="row">
            <div class="leftcolumn">
                <div class="card">
                    <h2> {{ post['title'] }} </h2>
                    <h5>Apr 19, 2021</h5>
                    <img id = "bloggImg" v-bind:src="'/static/img/' + post['imgUrl']">
                    <p>{{ post['content'] }}</p>
                    <div class="commentSection">
                        <h3>Comments:</h3>
                        <p v-for = 'comment in comments' ><b>Username: </b> {{comment.comment}}</p>
                    </div>
                </div>
            </div> 
            <div class="rightcolumn">
                <div class="card">
                    <h4>Back to <router-link to='/'>index</router-link></h4>
                </div>
  
                <div class="card" v-if='loggedIn'>
                    <div id="comments">
                        <h5> Post a comment here: </h5>
                        <textarea name="comment" id="comment" rows="10" tabindex="4"  required="required" v-model = 'comment'></textarea>
                        <button @click = 'onUpload(); postCmt()'> Submit comment </button>
                    </div>
                </div>

                <div class="card" v-if='loggedIn == false'>
                    <h5> <router-link to='/login'>Log in</router-link> to write a comment! </h5>
                </div>
            </div>
         </div>
         `,
         data(){ 
            return{
                post: [],
                postid: '',
                comment: '',
                comments: [],
                loggedIn: '',

            }
        },
        
        created: async function(){
            let postid = Vue.reactive(this.$route.params)
            let request = await fetch("/get_post_postid", { //POST request to backend Flask /post
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postid)
            });

            if (request.status == 200){ //200: Response is ready
                let result = await request.json();
                this.post = result;
            }

            let request2 = await fetch("/comments_get")
    
            if (request2.status == 200){ //200: Response is ready
                let result2 = await request2.json();
                this.comments = result2;
                console.log(this.comments)
            }

            let myValue = localStorage.getItem('User');
            if (myValue == null){
                this.loggedIn = false
            }
            else{
                this.loggedIn = true
            }  
            
        },
        methods: {
            onUpload: async function(){
                let post = Vue.reactive({comment: this.comment, postid: this.postid}) //Will be automatically updated when the data changes.
                let request = await fetch("/comment", { //POST request to backend Flask /post
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(post)
                });
                
    
            },
            postCmt: async function(){
                let request = await fetch("/comments_get")
    
                if (request.status == 200){ //200: Response is ready
                    let result = await request.json();
                    this.comments = result;
                }
            },
            
        }
}

let router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: [
        {path: '/', component: index},
        {path: '/login', component: login},
        {path: '/register', component: register},
        {path: '/post', component: post},
        {path: '/index/:postid', name: 'index', component: singlePost}
    ]
})


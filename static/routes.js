let index = {
    template: `
        <div class="row" :class="{largeText: selectedSize === 'large'}">
            <div class="leftcolumn">
                <div class="card" v-for="post in filteredList">
                    <router-link :to="{ name: 'index', params: { postid: post.postid }}"><h2> {{post.title}} </h2></router-link>
                    <h5>{{post.timestamp}}</h5>
                    <img id = "bloggImg" v-bind:src="'/static/img/' + post.imgUrl">
                    <p>{{post.content}}</p>
                </div>
            </div> 
            <div class="rightcolumn">
                <div class="card">
                    <div class="dropdown">
                        <span id='menu'>Menu ▼</span>
                        <div id ='dropdown' class="dropdown-content">
                            <router-link to='/login' v-if='loggedOut == true'><p>Login</p></router-link>
                            <router-link to='/login'@click='logoutMet()' v-if='loggedOut == false'><p>Logout</p></router-link>
                            <router-link to='/register' v-if='loggedOut == true'><p>Register</p></router-link>
                            <router-link to='/post' v-if='loggedOut == false'><p>Post</p></router-link>
                        </div>
                    </div>
                </div>
  
                <div class="card">
                    <div id="searchAndSort">
                        <p> Search for a title: </p>
                        <input type="text" placeholder="Search title" v-model="search">
                    </div>
                </div>

                <div class= 'card'> 
                        <p> Text size: </p>
                    <label>
                        <input type="radio" id="medium" name="mode" value="medium" v-model="selectedSize" checked> Medium
                    </label>

                    <label>
                        <input type="radio" id="large" name="mode" value="large" v-model="selectedSize"> Large
                    </label>
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
                search: '',
                textSize: 'medium',
                selectedSize: 'medium',
                loggedOut: true
            }
        },
        created: async function(){
            let request = await fetch("/get_post")

            if (request.status == 200){ //200: Response is ready
                let result = await request.json();
                this.posts = result;
            }

            let request2 = await fetch('/check_user')
            if (request2.status == 200){
                let result2 = await request2.json();
                this.loggedOut = result2.loggedOut
            }

        },
        methods: {
             logoutMet: async function(){
                localStorage.clear()
                let request = await fetch("/logout")

                if (request.status == 200){ //200: Response is ready
                    let result = await request.json();
                    this.loggedOut = result.loggedOut;
                }
                router.push({path: '/login'})
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
                    role: '',
                }
            }
        },
        created: async function(){
            let request2 = await fetch('/check_user')
            if (request2.status == 200){
                let result2 = await request2.json();
                if (result2.loggedOut == false){
                    router.push({path: '/'})
                }
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
                    localStorage.setItem('user', this.username);
                    localStorage.setItem('role', this.input.role)
                    router.push({ path: '/'})
                }
                else{
                    console.log(this.input.login)
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
                id: ''
            }
        }
    },
    created: async function(){
        let request2 = await fetch('/check_user')
            if (request2.status == 200){
                let result2 = await request2.json();
                if (result2.loggedOut == false){
                    router.push({path: '/'})
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
                let usernamelength = this.inputRegister.username.length;
                if (this.inputRegister.addSuccess == true){
                    router.push({ path: '/login'})
                } 
                else if (this.inputRegister.id == true) {
                    alert("This username is already taken.")
                }
                else if (usernamelength < 4){
                    alert('Username must be at least 4 characters.')
                }
                else if (this.inputRegister.password == ''){
                    alert('Please enter a password.')
                }
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
                <input type='file' accept="image/png, image/jpeg" @change='onFileChange'>
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
                filedata: null,
                url: '',
                admin: false
            }
        }
    },
    created: async function(){
            let request3 = await fetch('/check_role')
            if (request3.status == 200){
                let result3 = await request3.json();
                if (result3.admin == false){
                    router.push({path: '/'})
                }
            }
        },

    methods: {
        onFileChange(event) {
            this.filedata = event.target.files[0];
            this.imgUrl = this.filedata.name;
            const reader = new FileReader()
            reader.addEventListener('load', () =>{
                this.url = reader.result;
            });
            reader.readAsDataURL(this.filedata)

        },
        onUpload: async function(){
            let post = Vue.reactive({imgUrl: this.imgUrl, title: this.title, content: this.content, posted: this.posted, filedata: this.url}) //Will be automatically updated when the data changes.
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
                        <p v-for = 'comment in comments'><b> {{comment.username}}: </b> {{comment.comment}}</p>
                    </div>
                </div>
            </div> 
            <div class="rightcolumn">
                <div class="card">
                    <h4>Back to <router-link to='/'>index</router-link></h4>
                </div>
  
                <div class="card" v-if='loggedOut == false'>
                    <div id="comments">
                        <h5> Post a comment here: </h5>
                        <textarea name="comment" id="comment" rows="10" tabindex="4"  required="required" v-model = 'comment'></textarea>
                        <button @click = 'onUpload(); postCmt(); getCmt()'> Submit comment </button>
                    </div>
                </div>

                <div class="card" v-if='loggedOut'>
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
                loggedOut: true,
                userid: ''
            }
        },
        
        created: async function(){
            let postid = Vue.reactive(this.$route.params)
            this.postid = this.$route.params
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


            let postid3 = ({'postid': this.postid})
            let request3 = await fetch("/comments_get", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postid3)
            });
            if (request3.status = 200){
                let result3 = await request3.json();
                this.comments = result3;
            }
            let request4 = await fetch('/check_user')
            if (request4.status == 200){
                let result4 = await request4.json();
                this.loggedOut = result4.loggedOut;
            }
            
        },
        methods: {
            onUpload: async function(){
                this.username = localStorage.getItem('user');
                let post = Vue.reactive({comment: this.comment, postid: this.postid, username: this.username}) //Will be automatically updated when the data changes.
                let request = await fetch("/comment", { //POST request to backend Flask /post
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(post)
                });

                
    
            },
            postCmt: async function(){ 
                let postid2 = ({'postid': this.postid})
                let request = await fetch('/comments_get', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(postid2)
                });

                if (request.status == 200){ //200: Response is ready
                    let result = await request.json();
                    this.comments = result;
                }
            },

            getCmt: async function(){ //Denne er for at når man trykker på post så skal man fortsette å displaye alle kommentarene.
                let request = await fetch("/comments_get")
    
                if (request.status == 200){ //200: Response is ready
                    let result = await request.json();
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


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
                            <router-link to='/post' v-if='loggedOut == false && admin'><p>Post</p></router-link>
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
                selectedSize: 'medium',
                loggedOut: true,
                admin: false
            }
        },
        created: async function(){ //Get posts
            this.selectedSize = sessionStorage.getItem('selectedSize') //Saving text size preference in local storage
            let request = await fetch("/get_post")

            if (request.status == 200){ 
                let result = await request.json();
                this.posts = result;
            }

            let request2 = await fetch('/check_user') //Checks if user is logged in from backend session
            if (request2.status == 200){
                let result2 = await request2.json();
                this.loggedOut = result2.loggedOut
            }
            let request3 = await fetch('/check_role') //Checks role from backend session
            if (request3.status == 200){
                let result3 = await request3.json();
                this.admin = result3.admin
            }

        },
        methods: {
             logoutMet: async function(){
                let request = await fetch("/logout") //Pops session in backend

                if (request.status == 200){ 
                    let result = await request.json();
                    this.loggedOut = result.loggedOut;
                    sessionStorage.clear()
                }
                router.push({path: '/login'})
            },
            saveToSessionStorage(value) { //Save size prefrence in session
                sessionStorage.setItem("selectedSize", value);
              },
        },
        computed: {
            filteredList() { //Filter post with search
                return this.posts.filter(post => {
                    return post.title.toLowerCase().includes(this.search.toLowerCase())
                  })
                },
        },
        watch: {
            selectedSize(value) {
              this.saveToSessionStorage(value);
            },
          },
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
            let request2 = await fetch('/check_user') //Checks if logged in
            if (request2.status == 200){
                let result2 = await request2.json();
                if (result2.loggedOut == false){
                    router.push({path: '/'})
                }
            }
        },
        methods: {
            loginMet: async function() { //Login sent to backend check
                let login = Vue.reactive({username: this.username, password: this.password, login: this.login, role: this.role}) 
                let request = await fetch("/login", { 
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(login)
                });

                if (request.status == 200){ 
                    let result = await request.json();
                    this.input = result;
                }

                if (this.input.login == true){ //True if login is succsessfull. Setting local storage
                    localStorage.setItem('user', this.username);
                    localStorage.setItem('role', this.input.role)
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
                id: ''
            }
        }
    },
    created: async function(){
        let request2 = await fetch('/check_user') //Checks if user is logged in
            if (request2.status == 200){
                let result2 = await request2.json();
                if (result2.loggedOut == false){
                    router.push({path: '/'})
                }
            }
    },
    methods: {
        registerMet: async function() {
            let register = Vue.reactive({username: this.username, password: this.password}) 
            let request = await fetch("/register", { //Add to database or return error
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(register)
            });
            
            if (request.status == 200){ 
                let result = await request.json();
                this.inputRegister = result;
                let usernamelength = this.inputRegister.username.length;
                if (this.inputRegister.addSuccess == true){ 
                    router.push({ path: '/login'})
                } 
                else if (this.inputRegister.id == true) { //Validation data from backend
                    alert("This username is already taken.")
                }
                else if (usernamelength < 4){ //Validation data from backend
                    alert('Username must be at least 4 characters.')
                }
                else if (this.inputRegister.password == ''){ //Validation data from backend
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
    created: async function(){ //Checking if user or admin (role)
            let request3 = await fetch('/check_role')
            if (request3.status == 200){
                let result3 = await request3.json();
                if (result3.admin == false){
                    router.push({path: '/'})
                }
            }
        },

    methods: {
        onFileChange(event) { //Getting img url data
            this.filedata = event.target.files[0];
            this.imgUrl = this.filedata.name;
            const reader = new FileReader()
            reader.addEventListener('load', () =>{
                this.url = reader.result;
            });
            reader.readAsDataURL(this.filedata)

        },
        onUpload: async function(){
            let post = Vue.reactive({imgUrl: this.imgUrl, title: this.title, content: this.content, posted: this.posted, filedata: this.url}) 
            let request = await fetch("/post", { //Imagesave and add post to database
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(post)
            });
            
            if (request.status == 200){
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
                    <button id='deletePostBtn' v-if='admin' @click='delPost()'> Delete post </button>
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
                        <button @click = 'onUpload(); postCmt()'> Submit comment </button>
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
                userid: '',
                noHacking: null,
                admin: false,
            }
        },
        
        created: async function(){
            let postid = Vue.reactive(this.$route.params)
            this.postid = this.$route.params
            let request = await fetch("/get_post_postid", { //Get post from table with postid
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
            let request3 = await fetch("/comments_get", { //Get comments by postid
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
            let request4 = await fetch('/check_user') //Check if logged in for comment auth
            if (request4.status == 200){
                let result4 = await request4.json();
                this.loggedOut = result4.loggedOut;
            }

            let request5 = await fetch('/check_role') //Check if logged in for comment auth
            if (request5.status == 200){
                let result5 = await request5.json();
                this.admin = result5.admin;
            }
            
        },
        methods: {
            onUpload: async function(){
                this.username = localStorage.getItem('user');
                let post = Vue.reactive({comment: this.comment, postid: this.postid, username: this.username}) //Adds comment with some localStorage safety.
                let request = await fetch("/comment", { //POST request to backend Flask /post
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(post)
                });

                if (request.status == 200){ //200: Response is ready
                    let result = await request.json();
                    this.noHacking = result.noHacking;
                }
                
    
            },
            postCmt: async function(){  //Get comments on post comment click 
                let postid2 = ({'postid': this.postid})
                let request = await fetch('/comments_get', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(postid2)
                });

                if (request.status == 200){ 
                    let result = await request.json();
                    this.comments = result;
                }
            },


            delPost: async function(){ //Delete post at click with admin role
                let postid = Vue.reactive(this.$route.params)
                let request = await fetch("/delete_post", { //Get post from table with postid
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(postid)
                });
                if (request.status == 200){ //200: Response is ready
                    router.push({ path: '/'})
                }
            }
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


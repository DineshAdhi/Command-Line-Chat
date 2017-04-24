var chalk = require('chalk')
var figlet = require('figlet')
var inquirer = require('inquirer');
var firebase = require('firebase')
var currentUser = "";

console.log(chalk.red( figlet.textSync('FireChat',{ horizontalLayout: 'full' })))

var config = {
  apiKey: "AIzaSyD_onY7CgdjK-TbYc3HVS8z3WUqu9IZ4eE",
  authDomain: "demoforpython.firebaseapp.com",
  databaseURL: "https://demoforpython.firebaseio.com",
  projectId: "demoforpython",
  storageBucket: "demoforpython.appspot.com",
  messagingSenderId: "790152929558"
};

firebase.initializeApp(config);

var loginQuestion = [
  {
    name :'loginPrompt',
    type : 'list',
    message : "Please Choose :",
    choices : ["1. Login", "2. Sign up"]
  },
];

inquirer.prompt(loginQuestion).then(function (res) {
	 if(res.loginPrompt == "1. Sign up"){
     signupUser()
   }
   else {
     loginUser()
   }
});

function signupUser() {
  var signupQuestions = [
    {
      name : 'username',
      type : 'input',
      message : 'Username : ',
    },
    {
      name : 'email',
      type : 'email',
      message : 'Email :',
    },
    {
      name : 'password',
      type : 'password',
      message : 'Password :'
    }
  ]

  inquirer.prompt(signupQuestions).then(function(res) {

    firebase.auth().createUserWithEmailAndPassword(res.email,res.password).catch(function(err){
      console.log(chalk.red(err.message))
      process.exit()
    }).then(function(){
      firebase.database().ref('/users').push(res).then(function(){
        console.log(chalk.green("Your account has been successfully created"));
        loginUser()
      })
    });
  })

}


function loginUser()
{
  var loginQuestions = [
    {
      name :'email',
      type : 'email',
      message : 'Email :'
    },
    {
      name : 'password',
      type : 'password',
      message :'Password'
    }
  ]

  inquirer.prompt(loginQuestions).then(function(res){
    currentUser = res.email;
    firebase.auth().signInWithEmailAndPassword(res.email, res.password).catch(function(error){
      console.log(error.message);
      process.exit();
    }).then(function(){
      process.stdout.write('\033c');
      console.log(chalk.red( figlet.textSync('Welcome Aboard',{ horizontalLayout: 'full' })));
      console.log(chalk.green("You have been logged in successfully"))
      beginChat()
    })
  })

}


function beginChat()
{
  var chatQuestion = [{
    name : 'message',
    type : 'input',
    message : ' '
  }]
  console.log(chalk.blue("Let's rock and roll"))
  console.log(chalk.red("Prompt '!exit!' to quit the chatapp"))
  getMessage()

  function getMessage()
  {
    inquirer.prompt(chatQuestion).then(function(res){
      if(res.message == "!exit!")
      {
        firebase.auth().signOut().then(function(){
          console.log(chalk.green("You have been signed out succesfully, Thanks for using Firechat"));
          process.exit(0);
        })
      }
      firebase.database().ref('/chats').push({'sender':currentUser, 'message':res.message})
      getMessage()
    })
  }

  firebase.database().ref('/chats').on('child_added', function(snapshot){
    if(snapshot.val().sender!=currentUser)
        console.log(chalk.green(snapshot.val().sender)+" : " + snapshot.val().message)
  })
}

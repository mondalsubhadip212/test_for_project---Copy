$(document).ready(function () {
  //url center for server
  // const url_server = `https://crabsnilchat.herokuapp.com`
  const url_server = `http://127.0.0.1:8000`
  // const url_server_chat = `tcp://6.tcp.ngrok.io:19809`
  const url_center = {
    home: `${url_server}/`,
    signup: `${url_server}/signup`,
    login: `${url_server}/login`,
    user_details: `${url_server}/user_details`,
    access_token: `${url_server}/access_token`,
    logout: `${url_server}/logout`,
    chat : `ws://127.0.0.1:8000/chat`,
  };

  // modal alert stuffs
  const modal_alert = {
    modal_alert: $("#alert_modal"),
    modal_alert_header: $("#alert_modal_header"),
    modal_alert_header_title: $("#alert_modal_title"),
    modal_alert_body: $("#alert_modal_body"),
    modal_alert_body_content_1: $("#alert_modal_body_content_1"),
  };

  // loading screen activate
  function overlay_activate() {
    $("#overlay").css("display", "block");
  }

  // loading screen deactivate
  function overlay_deactivate() {
    $("#overlay").css("display", "none");
  }

  // after login button hide button - signup, login etc and loading the chat interface for user
  function after_login_activity() {
    $("#sign_up_button").hide();
    $("#login_button").hide();
    $("#logout_button").show();
    $("#user_button").show();
    $("#setting_button").show();
    // $('#chat').load("./HTML/chat.html")
  }

  // setting refresh token and access token in cookies
  function set_cookies(authorization) {
    const tokens = authorization.split(";");
    const refresh = tokens[0].split(" ");
    const access = tokens[1].split(" ");
    document.cookie = `${refresh[0]}=${refresh[1]};samesite=strict;max-age=${
      60 * 60 * 24 * 180
    };path=/;`;
    document.cookie = `${access[0]}=${access[1]};samesite=strict;max-age=${
      60 * 15
    };path=/;`;
  }

  // setting null values in refresh token and access token or clearing cookies
  function set_null_cookies() {
    document.cookie = `refresh=;samesite=strict;max-age=${0};path=/;`;
    document.cookie = `access=;samesite=strict;max-age=${0};path=/;`;
  }

  // setting access token from refresh token - sent by server
  function set_access_token_from_refresh_token(access_token) {
    document.cookie = `access=${access_token};samesite=strict;max-age=${
      60 * 15
    };path=/;`;
  }

  // getting access token from cookies
  function get_access_token_cookie() {
    if (document.cookie === "") {
      return "no cookie";
    } else {
      let total_cookie = document.cookie.split("; ");
      for (i in total_cookie) {
        if (total_cookie[i].split("=")[0] === "access") {
          return total_cookie[i].split("=")[1];
        }
      }
      return "no cookie";
    }
  }

  // getting acces token from server exchanging refresh token
  function get_aceess_token_server(refresh_token) {
    if (refresh_token === "no cookie") {
      return "no cookie";
    } else {
      let ajax = $.ajax(url_center["access_token"], {
        method: "post",
        dataType: "json",
        data: {
          refresh: `${refresh_token}`,
        },
      });
      ajax.done(function (msg) {
        set_access_token_from_refresh_token(msg["access"]);
        location.reload();
      });
      ajax.fail(function (msg) {
        console.clear();
        modal_alert["modal_alert_header_title"].html("Account Required :)");
        modal_alert["modal_alert_body_content_1"].html(
          "Create an account or login :)"
        );
        modal_alert["modal_alert_header"].css("background-color", "#CAFFBF");
        modal_alert["modal_alert"].modal();
      });
    }
  }

  // getting refresh token from cookies
  function get_refresh_token_cookie() {
    if (document.cookie === "") {
      return "no cookie";
    } else {
      let total_cookie = document.cookie.split("; ");
      for (i in total_cookie) {
        if (total_cookie[i].split("=")[0] === "refresh")
          return total_cookie[i].split("=")[1];
      }
      return "no cookie";
    }
  }

  // form data null check
  function form_data_null_check(val) {
    if (val !== "") {
      return val;
    } else {
      return undefined;
    }
  }

  // for user auto login
  function auto_login() {
    try {
      let access_token = get_access_token_cookie();
      let refresh_token = get_refresh_token_cookie();

      if (access_token !== "no cookie" && refresh_token !== "no cookie") {
        overlay_activate();
        let ajax = $.ajax(url_center["user_details"], {
          method: "get",
          dataType: "json",
          headers: {
            Authorization: `Bearer ${get_access_token_cookie()}`,
          },
        });
        ajax.done(function (msg) {
          // successfully login event
          $("#user_username").html(`${msg.username}`);
          $("#user_email").html(`${msg.email}`);
          $("#user_userid").html(`${msg.userid}`);
          // after login user details are going to access from the server and other methods are called - chat connect, friend list update shown etc.
          after_successfully_login(msg.email,msg.friends)
          after_login_activity();
          overlay_deactivate();
        });
        ajax.fail(function (msg) {
          console.clear();
          overlay_deactivate();
          modal_alert["modal_alert_header_title"].html("Error :(");
          modal_alert["modal_alert_body_content_1"].html(
            "Something went wrong , login or signup :)"
          );
          modal_alert["modal_alert_header"].css("background-color", "#E63946");
          modal_alert["modal_alert"].modal();
        });
      } else {
        overlay_activate();
        if (access_token === "no cookie") {
          if (get_aceess_token_server(refresh_token) === "no cookie") {
            console.clear();
            overlay_deactivate();
            modal_alert["modal_alert_header_title"].html("Account Required :)");
            modal_alert["modal_alert_body_content_1"].html(
              "Create an account or login :)"
            );
            modal_alert["modal_alert_header"].css(
              "background-color",
              "#CAFFBF"
            );
            modal_alert["modal_alert"].modal();
          } else {
            console.clear();
            get_aceess_token_server(refresh_token);
            overlay_deactivate();
          }
        } else {
          console.clear();
          overlay_deactivate();
          modal_alert["modal_alert_header_title"].html("Account Required :)");
          modal_alert["modal_alert_body_content_1"].html(
            "Create an account or login :)"
          );
          modal_alert["modal_alert_header"].css("background-color", "#CAFFBF");
          modal_alert["modal_alert"].modal();
        }
      }
    } catch {
      console.log("something went wrong while auto login and its in catch");
    }
  }

  // for user sign up
  function sign_up_form() {
    //signup form reset
    let sign_up_form = $("form")[0];
    $("#sign_up_submit").on("click", function () {
      //fadeout alert for signup form
      setTimeout(function () {
        $("#sign_up_main_alert").fadeOut("slow");
      }, 3000);
      //form data
      let sign_up_form_data = {
        username: form_data_null_check($("#signup_username").val()),
        email: form_data_null_check($("#signup_email").val()),
        password1: $("#signup_password1").val(),
        password2: $("#signup_password2").val(),
      };
      let sign_up_form_checkbox = $("#sign_up_check");
      let password1 = sign_up_form_data["password1"];
      let password2 = sign_up_form_data["password2"];
      //if conditions valid the ajax call is going to made
      if (
        sign_up_form_checkbox.is(":checked") === true &&
        password1 === password2 &&
        password1 !== "" &&
        password2 !== ""
      ) {
        let ajax_return = $.ajax(url_center["signup"], {
          method: "post",
          dataType: "json",
          data: sign_up_form_data,
        });
        ajax_return.done(function (msg) {
          $.each(msg, function (key, value) {
            if (key === "success") {
              $("#sign_up_alert").html(
                `<div class="alert alert-success" role="alert" id="sign_up_main_alert">${value}</div>`
              );
              sign_up_form.reset();
            } else if (key === "error") {
              $("#sign_up_alert").html(
                `<div class="alert alert-danger" role="alert" id="sign_up_main_alert">${value}</div>`
              );
              sign_up_form.reset();
            }
          });
        });
      }
      //other stuffs related to signup confirm password, password must be there etc
      else if (sign_up_form_checkbox.is(":checked") === false) {
        $("#sign_up_alert").html(
          `<div class="alert alert-warning" role="alert" id="sign_up_main_alert">please confirm</div>`
        );
      } else if (password1 !== password2) {
        $("#sign_up_alert").html(
          `<div class="alert alert-warning" role="alert" id="sign_up_main_alert">password must match</div>`
        );
      } else if (password1 === "" || password2 === "") {
        $("#sign_up_alert").html(
          `<div class="alert alert-warning" role="alert" id="sign_up_main_alert">password required</div>`
        );
      }
    });
    $("#sign_up_close").on("click", function () {
      sign_up_form.reset();
    });
  }

  //for user login
  function login() {
    $("#login_button").on("click", function () {
      $("#login_submit").on("click", function () {
        overlay_activate();
        let login_form_data = {
          username: form_data_null_check($("#login_username").val()),
          password: form_data_null_check($("#login_password").val()),
        };
        if (
          login_form_data["username"] !== undefined &&
          login_form_data["password"] !== undefined
        ) {
          let ajax = $.ajax(url_center["login"], {
            method: "post",
            dataType: "json",
            data: login_form_data,
            async: true,
          });
          ajax.done(function (msg) {
            set_cookies(ajax.getResponseHeader("authorization"));
            auto_login();
            $("#login_alert").html(
              `<div class="alert alert-success" role="alert" id="sign_up_main_alert">${msg["success"]}</div>`
            );
            overlay_deactivate();
            console.clear();
          });
          ajax.fail(function (msg) {
            overlay_deactivate();
            console.clear();
            $("#login_alert").html(
              `<div class="alert alert-danger" role="alert" id="sign_up_main_alert">Invalid Credentials :(</div>`
            );
          });
        }
      });
    });
  }

  // for user logout
  function logout() {
    $("#logout_button").on("click", function () {
      overlay_activate();
      auto_login();
      set_null_cookies();
      setTimeout(() => {
        location.reload(1);
      }, 2000);
    });
  }

  // all the chat and messaging relates things start from here
  // chat - friend-list - add-friend etc

    // for chat connect 
    function chat_connect(email){
      overlay_activate()
      try{
        let ws_connection = new WebSocket(
          `${url_center['chat']}/${email}`
        )
        return ws_connection
      }
      catch{
        console.log("something went wrong while connecting to websocket :(")
      }
    }

    // for chat message sent to a perticular user or group
    function chat_sent_message(sender,receiver,message,ws_connection){
      try{
        let content = JSON.stringify({
          "sender" : sender,
          "receiver" : receiver,
          "message" : message
        })
        ws_connection.send(content)
      }
      catch{
        console.log('something went wrong while sending message')
      }
    }

    function chat_receive_message(ws_connection){
      ws_connection.onmessage = (e)=>{
        let receive_data = JSON.parse(e.data)
        $(`#${receive_data["receiver"]}_receive`).append(`<h5>${receive_data["message"]}</h5>`)
      }
    }

  // after successfully login this function is going to be called
  function after_successfully_login(email,friends){
    $("#chat").load('./HTML/chat.html',function(){

      // to connect a user with the server using websocket
      let ws_connection = chat_connect(email)

      // while the connection is open a serie of below function is being called
      ws_connection.onopen = ()=>{

        overlay_deactivate()

        // to show the friend list
        user_friend_list(friends,email)

        // to create a unique chat box for each friends of the current user
        user_chat_section_for_friends(friends,ws_connection)

        chat_receive_message(ws_connection)

        
      }
    })
  }

  // for showing the friend list of a user and adding a unique id
  function user_friend_list(friend_list,email){
    friends = JSON.parse(friend_list)['friends']
    $.each(friends, function (indexInArray, valueOfElement) { 
       $("#friend_list_section").append(
         `        <button
         type="button"
         class="list-group-item list-group-item-action"
         style="font-weight:bold;background-color: transparent;margin:5px;border-color:black;color:white;"
         id=${email}####${valueOfElement}
        >
        ${valueOfElement}
        </button>`
       )
    });
  }

  // to create a unique chat box for each friends of a current user
  function user_chat_section_for_friends(friends,ws_connection){

    let friend_list = JSON.parse(friends)['friends']

     // appending the chat box for all the friends of a current user and primariliy display==none 
    $.each(friend_list,function(indexInArray,valueOfElement){
      $("#chat_message_sent_receive_section").append(
        `<!-- this is for chat box name to see which friends chat is open -->
        <div style="display:none" id="${valueOfElement}">
        <div class="row">
            <h3 class="col text-center">
            ${valueOfElement}
            </h3>
        </div>
        <!-- this is for receive message and sent message seen option -->
        <div class="row">
            <!-- chat message receive section -->
            <div class="col" id="chat_message_receive_section">
                <div class="row">
                    <div class="col" id="${valueOfElement}_receive">
                    </div>
                </div>
            </div>
            <!-- chat message sent section -->
            <div class="col" id="chat_message_sent_section">
                <div class="row">
                    <div class="col" id="${valueOfElement}_sent">
                    </div>
                </div>
            </div>
        </div>
        </div>`
      )
    })

    // to show the perticualr friends chat box || display==block
    $("#friend_list_section").children().on('click',(e)=>{
      let chat_box_id = e.target.id.split("####")[1]
      let receiver = chat_box_id
      let sender = e.target.id.split("####")[0]
      $(`#${chat_box_id}`).css('display','block')

      // after clicking the sent button - sent message section
      $("#sent_button_section").on("click", function () {

        let message = $("#message_type_section").val();
        $("#message_type_section").prop("value", "");
        $(`#${chat_box_id}_sent`).append(`<h5>${message}</h5>`)
        chat_sent_message(sender,receiver,message,ws_connection)
    });



    })
  }


  auto_login()
  login()
  sign_up_form()
  logout()
});

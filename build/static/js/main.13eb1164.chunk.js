(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{39:function(e,t,a){e.exports=a(82)},47:function(e,t,a){},82:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),l=a(19),o=a.n(l),c=(a(45),a(47),a(6)),i=a(7),s=a(9),u=a(8),d=a(10),m=a(86),p=a(85),h=a(83),g=function(e){function t(){var e,a;Object(c.a)(this,t);for(var n=arguments.length,r=new Array(n),l=0;l<n;l++)r[l]=arguments[l];return(a=Object(s.a)(this,(e=Object(u.a)(t)).call.apply(e,[this].concat(r)))).logOut=function(){localStorage.removeItem("Token"),localStorage.removeItem("User"),a.props.history.push("/login")},a}return Object(d.a)(t,e),Object(i.a)(t,[{key:"render",value:function(){var e=localStorage.getItem("User");return r.a.createElement("div",{className:"header"},e&&r.a.createElement("div",{className:"right-block"},r.a.createElement("button",{onClick:this.logOut},"Log Out"),r.a.createElement("div",{className:"username"},e)))}}]),t}(n.Component),E=Object(h.a)(g),f=a(37),C=a.n(f),v=Object({NODE_ENV:"production",PUBLIC_URL:""}).REACT_APP_API_URL||"http://localhost:4000",O=C.a.create({baseURL:v,timeout:1e4,headers:{Authorization:localStorage.getItem("Token")}});O.interceptors.request.use(function(e){return e},function(e){return alert("sss"),e.response&&401===e.response.status&&(localStorage.removeItem("Token"),localStorage.removeItem("User"),document.cookie="token=; path=/;",window.location.push("/login")),Promise.reject(e)});var b=a(2),y=function(e){function t(){var e,a;Object(c.a)(this,t);for(var n=arguments.length,r=new Array(n),l=0;l<n;l++)r[l]=arguments[l];return(a=Object(s.a)(this,(e=Object(u.a)(t)).call.apply(e,[this].concat(r)))).state={email:"",password:""},a.submit=function(){var e=a.state,t=e.email,n=e.password;O.post("/logins",{email:t,password:n}).then(function(e){console.log(e),localStorage.setItem("Token",e.data.token),localStorage.setItem("User",e.data.data.email),setTimeout(function(){return a.props.history.push("/clients")},1e3)}).catch(function(e){b.toast.error("Invalid email or password",{position:b.toast.POSITION.BOTTOM_CENTER,autoClose:!1,hideProgressBar:!0})})},a}return Object(d.a)(t,e),Object(i.a)(t,[{key:"render",value:function(){var e=this;return r.a.createElement("div",{className:"login col-12 col-md-2 offset-md-5"},r.a.createElement("input",{type:"text",placeholder:"Email Address",value:this.state.email,onChange:function(t){return e.setState({email:t.target.value})}}),r.a.createElement("input",{type:"password",placeholder:"Password",value:this.state.password,onChange:function(t){return e.setState({password:t.target.value})}}),r.a.createElement("button",{onClick:this.submit},"Sign In"))}}]),t}(n.Component),j=Object(h.a)(y),T=a(12),N=function(e){function t(){var e,a;Object(c.a)(this,t);for(var n=arguments.length,l=new Array(n),o=0;o<n;o++)l[o]=arguments[o];return(a=Object(s.a)(this,(e=Object(u.a)(t)).call.apply(e,[this].concat(l)))).state={client:null,date:"",action:"",actions:[]},a.renderClient=function(){var e=a.state.client;return e&&r.a.createElement("div",{className:"history"},r.a.createElement("div",{className:"header-title"},r.a.createElement("h4",null,"Client: "),r.a.createElement("h2",null,e.name),r.a.createElement("h4",null,"Project:"),r.a.createElement("h2",null,e.project),r.a.createElement("h4",null,"Department: "),r.a.createElement("h2",null,e.department.name)),r.a.createElement("div",{className:"new-action-form"},r.a.createElement("input",{type:"date",placeholder:"Date",value:a.state.date,onChange:function(e){return a.setState({date:e.target.value})}}),r.a.createElement("input",{type:"text",placeholder:"Action",value:a.state.action,onChange:function(e){return a.setState({action:e.target.value})}}),r.a.createElement("button",{onClick:a.createAction},"Add")))},a.createAction=function(){a.state.date&&a.state.action?O.post("/actions",{date:a.state.date,title:a.state.action,client_id:a.state.client.id}).then(function(e){var t=a.state.client.actions;t&&t.length?t.push(e.data):t=[e.data],a.setState({client:Object(T.a)({},a.state.client,{actions:t})})}).catch(function(e){b.toast.error("Unable to create action!",{position:b.toast.POSITION.BOTTOM_CENTER,autoClose:!1,hideProgressBar:!0})}):b.toast.error("Fields are missing!",{position:b.toast.POSITION.BOTTOM_CENTER,autoClose:!1,hideProgressBar:!0})},a.renderActions=function(){return a.state.client&&a.state.client.actions&&0!==a.state.client.actions.length?a.state.client.actions.map(function(e){return r.a.createElement("tr",{key:e.title},r.a.createElement("td",null,e.date.split("T")[0]),r.a.createElement("td",null,e.title.split(":")[0]),r.a.createElement("td",null,e.title.split(":")[1]))}):null},a}return Object(d.a)(t,e),Object(i.a)(t,[{key:"componentDidMount",value:function(){var e=this;console.log(this.props),O.get("/clients/"+this.props.match.params.id).then(function(t){e.setState({client:t.data}),console.log(t)}).catch(function(t){console.log(t),401===t.response.status?e.props.history.push("/login"):b.toast.error("Unable to load client!",{position:b.toast.POSITION.BOTTOM_CENTER,autoClose:!1,hideProgressBar:!0})})}},{key:"render",value:function(){return r.a.createElement("div",{className:"actions col-12 col-md-8 offset-md-2"},this.renderClient(),r.a.createElement("table",{border:"1px"},r.a.createElement("thead",null,r.a.createElement("tr",null,r.a.createElement("td",{className:"short"},"Date"),r.a.createElement("td",{className:"short"},"Manager"),r.a.createElement("td",null,"Action"))),r.a.createElement("tbody",null,this.renderActions())))}}]),t}(n.Component),k=Object(h.a)(N),w=a(38),S=a(14),I=a(84),_=["white","#E5E5E5","#DEACC3","#F4AD9C","#ACC7ED","#E5FFF9","#FFFFC3","#CAF7AD"],P=function(e){function t(){var e,a;Object(c.a)(this,t);for(var l=arguments.length,o=new Array(l),i=0;i<l;i++)o[i]=arguments[i];return(a=Object(s.a)(this,(e=Object(u.a)(t)).call.apply(e,[this].concat(o)))).state={clients:[],departments:[],newClientArgs:{},hasMore:!1,page:0,palette:!1,editing:{}},a.getClients=function(){O.get("/clients?page=".concat(a.state.page)).then(function(e){a.setState({clients:0===a.state.page?e.data:a.state.clients.concat(e.data),hasMore:10===e.data.length,page:a.state.page+1}),console.log(e)}).catch(function(e){console.log(e),401===e.response.status?a.props.history.push("/login"):b.toast.error("Unable to load clients!",{position:b.toast.POSITION.BOTTOM_CENTER,autoClose:!1,hideProgressBar:!0})})},a.renderClients=function(){return a.state.clients.map(function(e,t){var l=e.action?e.action.title:"nothing yet",o=a.state.editing.id===e.id,c=a.state.editing;return r.a.createElement("tr",{key:e.name+t,style:{backgroundColor:_[e.note]}},r.a.createElement("td",null,o?r.a.createElement("input",{type:"text",value:c.name,onChange:function(e){return a.applyEditValue(e.target.value,"name")}}):e.name,r.a.createElement("div",{className:"side-controls-block"},r.a.createElement("i",{className:"fa fa-paint-brush",onClick:function(){return a.setState({palette:a.state.palette!==e.id&&e.id})}}),o?r.a.createElement(n.Fragment,null,r.a.createElement("i",{className:"fa fa-close",onClick:function(){return a.setState({editing:{}})}}),r.a.createElement("i",{className:"fa fa-check",onClick:a.updateClient})):r.a.createElement("i",{className:"fa fa-edit",onClick:function(){return a.setState({editing:e})}}),r.a.createElement("i",{className:"fa fa-trash",onClick:function(){return a.destroyItem(e.id)}}))),r.a.createElement("td",null,o?r.a.createElement("input",{type:"text",value:c.project,onChange:function(e){return a.applyEditValue(e.target.value,"project")}}):e.project),r.a.createElement("td",null,o?r.a.createElement("select",{placeholder:"Department",onChange:function(e){return a.applyEditValue(e.target.value,"department_id")}},a.state.departments.map(function(e){return r.a.createElement("option",{key:"dep"+e.id,value:e.id},e.name)})):e.department.name),r.a.createElement("td",null,o?r.a.createElement("input",{type:"text",value:c.estimate,onChange:function(e){return a.applyEditValue(e.target.value,"estimate")}}):e.estimate),r.a.createElement("td",null,o?r.a.createElement("input",{type:"text",value:c.budget,onChange:function(e){return a.applyEditValue(e.target.value,"budget")}}):e.budget),r.a.createElement("td",null,o?r.a.createElement("input",{type:"date",value:c.start_date,onChange:function(e){return a.applyEditValue(e.target.value,"start_date")}}):e.start_date),r.a.createElement("td",null,r.a.createElement(I.a,{to:"/client/".concat(e.id),className:"invites-link"},l)))})},a.applyEditValue=function(e,t){a.setState({editing:Object(T.a)({},a.state.editing,Object(S.a)({},t,e))})},a.updateClient=function(){var e=a.state.editing,t=a.state.clients.find(function(t){return t.id===e.id}),n=Object(T.a)({},e.name&&e.name!==t.name&&{name:e.name},e.project&&e.project!==t.project&&{project:e.project},e.estimate&&e.estimate!==t.estimate&&{estimate:e.estimate},e.budget&&e.budget!==t.budget&&{budget:e.budget},e.start_date&&e.start_date!==t.start_date&&{start_date:e.start_date},e.department_id&&e.department_id!==t.department.id&&{department_id:e.department_id});0!==Object.keys(n).length?O.put("/clients/".concat(e.id),{client:n}).then(function(e){var t=a.state.clients;t[t.findIndex(function(t){return t.id===e.data.id})]=e.data,a.setState({clients:t,editing:{}})}).catch(function(e){b.toast.error("Unable to update client!",{position:b.toast.POSITION.BOTTOM_CENTER,autoClose:!1,hideProgressBar:!0})}):a.setState({editing:{}})},a.destroyItem=function(e){O.delete("/clients/".concat(e)).then(function(t){var n=a.state.clients;a.setState({page:0,clients:n.filter(function(t){return t.id!==e})})}).catch(function(e){b.toast.error("Unable to delete client!",{position:b.toast.POSITION.BOTTOM_CENTER,autoClose:!1,hideProgressBar:!0})})},a.createClient=function(){var e=a.state.newClientArgs,t=e.name,n=e.project,r=e.department_id,l=e.estimate,o=e.budget,c=e.start_date;if(!t||!n||!l||!o||!c)return b.toast.error("Fields are missing!",{position:b.toast.POSITION.BOTTOM_CENTER,autoClose:!1,hideProgressBar:!0});var i=r;r&&0===r||(i=(a.state.departments[0]||{}).id),O.post("/clients",{client:Object(T.a)({},a.state.newClientArgs,{department_id:i})}).then(function(e){a.setState({page:0,clients:Object(w.a)(a.state.clients).concat([e.data])})}).catch(function(e){b.toast.error("Unable to create client!",{position:b.toast.POSITION.BOTTOM_CENTER,autoClose:!1,hideProgressBar:!0})})},a.applyClientValue=function(e,t){a.setState({newClientArgs:Object(T.a)({},a.state.newClientArgs,Object(S.a)({},t,e))})},a.addNewUserForm=function(){var e=a.state.newClientArgs,t=e.name,n=e.project,l=(e.department_id,e.estimate),o=e.budget,c=e.start_date;return r.a.createElement("div",{className:"add-client-form"},r.a.createElement("input",{type:"text",placeholder:"Name",value:t||"",onChange:function(e){return a.applyClientValue(e.target.value,"name")},style:{width:"15%"}}),r.a.createElement("input",{type:"text",placeholder:"Project",value:n||"",onChange:function(e){return a.applyClientValue(e.target.value,"project")},style:{width:"15%"}}),r.a.createElement("select",{placeholder:"Department",onChange:function(e){return a.applyClientValue(e.target.value,"department_id")}},a.state.departments.map(function(e){return r.a.createElement("option",{key:"dep"+e.id,value:e.id},e.name)})),r.a.createElement("input",{type:"number",placeholder:"Est",value:l||"",onChange:function(e){return a.applyClientValue(e.target.value,"estimate")}}),r.a.createElement("input",{type:"number",placeholder:"Bdjt",value:o||"",onChange:function(e){return a.applyClientValue(e.target.value,"budget")}}),r.a.createElement("input",{type:"date",placeholder:"Start Date",value:c||"",onChange:function(e){return a.applyClientValue(e.target.value,"start_date")},style:{width:"15%"}}),r.a.createElement("button",{onClick:a.createClient},"Create"))},a.updateColor=function(e){O.put("/clients/".concat(a.state.palette),{client:{note:e}}).then(function(t){var n=a.state.clients;n[n.findIndex(function(e){return e.id===a.state.palette})].note=e,a.setState({clients:n,palette:!1})}).catch(function(e){b.toast.error("Unable to cupdate colour!",{position:b.toast.POSITION.BOTTOM_CENTER,autoClose:!1,hideProgressBar:!0})})},a.renderPalette=function(){return r.a.createElement("div",{className:"palette"},_.map(function(e,t){return r.a.createElement("div",{className:"opt",style:{backgroundColor:e},onClick:function(){return a.updateColor(t)}})}))},a}return Object(d.a)(t,e),Object(i.a)(t,[{key:"componentDidMount",value:function(){var e=this;this.getClients(),O.get("/departments").then(function(t){e.setState({departments:t.data.departments})}).catch(function(e){})}},{key:"render",value:function(){return r.a.createElement("div",{className:"dashboard col-12 col-md-8 offset-md-2"},this.addNewUserForm(),!1!==this.state.palette&&this.renderPalette(),r.a.createElement("table",{border:"1px",className:"clients-table"},r.a.createElement("thead",null,r.a.createElement("tr",null,r.a.createElement("td",null,"Client"),r.a.createElement("td",null,"Project"),r.a.createElement("td",null,"Department"),r.a.createElement("td",null,"Estimate (h)"),r.a.createElement("td",null,"Budget ($)"),r.a.createElement("td",null,"Start Date"),r.a.createElement("td",null,"History"))),r.a.createElement("tbody",null,this.renderClients())))}}]),t}(n.Component),A=Object(h.a)(P),B=(a(78),a(80),function(e){function t(){return Object(c.a)(this,t),Object(s.a)(this,Object(u.a)(t).apply(this,arguments))}return Object(d.a)(t,e),Object(i.a)(t,[{key:"render",value:function(){return r.a.createElement(m.a,null,r.a.createElement("div",{onClick:function(e){return b.toast.dismiss()}},r.a.createElement("div",null,r.a.createElement(E,{triggerUpdate:this.triggerUpdate}),r.a.createElement(p.a,{exact:!0,path:"/",render:function(e){return r.a.createElement(A,e)}}),r.a.createElement(p.a,{path:"/clients",render:function(e){return r.a.createElement(A,e)}}),r.a.createElement(p.a,{path:"/login",component:j}),r.a.createElement(p.a,{path:"/client/:id",component:k})),r.a.createElement(b.ToastContainer,{autoClose:3e3})))}}]),t}(n.Component));Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(r.a.createElement(B,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[39,2,1]]]);
//# sourceMappingURL=main.13eb1164.chunk.js.map
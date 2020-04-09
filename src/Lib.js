import axios from 'axios';

const API_URL= process.env.REACT_APP_API_URL || 'https://testtesttza.herokuapp.com/'
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {'Authorization': localStorage.getItem('Token')},
});

api.interceptors.request.use(cfg => {return cfg}, err => {
  alert('sss')
  if(err.response && err.response.status === 401) {
    // alert('sss')
    localStorage.removeItem('Token')
    localStorage.removeItem('User')
    document.cookie = `token=; path=/;`
    window.location.push("/login");
  }
  return Promise.reject(err);
})
